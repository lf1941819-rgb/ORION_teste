import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { google } from 'googleapis';
import cookieSession from 'cookie-session';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(cookieSession({
    name: 'session',
    keys: [process.env.SESSION_SECRET || 'orion-secret'],
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: true,
    sameSite: 'none',
  }));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL}/api/auth/google/callback`
  );

  // Auth Routes
  app.get('/api/auth/google/url', (req, res) => {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    res.json({ url });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code as string);
      req.session!.tokens = tokens;
      
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS' }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Autenticação concluída. Você pode fechar esta janela.</p>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error exchanging code:', error);
      res.status(500).send('Authentication failed');
    }
  });

  app.get('/api/auth/google/status', (req, res) => {
    res.json({ isAuthenticated: !!req.session?.tokens });
  });

  app.post('/api/auth/google/logout', (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  // Google Workspace Routes
  app.post('/api/google/schedule', async (req, res) => {
    if (!req.session?.tokens) {
      return res.status(401).json({ error: 'Not authenticated with Google' });
    }

    const { eventData, pdfBase64, fileName } = req.body;
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    auth.setCredentials(req.session.tokens);

    try {
      const drive = google.drive({ version: 'v3', auth });
      const calendar = google.calendar({ version: 'v3', auth });

      // 1. Get or Create ÓRION Folder
      let folderId = '';
      const folderSearch = await drive.files.list({
        q: "name = 'ÓRION LAB' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id)',
      });

      if (folderSearch.data.files && folderSearch.data.files.length > 0) {
        folderId = folderSearch.data.files[0].id!;
      } else {
        const folderMetadata = {
          name: 'ÓRION LAB',
          mimeType: 'application/vnd.google-apps.folder',
        };
        const folder = await drive.files.create({
          requestBody: folderMetadata,
          fields: 'id',
        });
        folderId = folder.data.id!;
      }

      // 2. Upload PDF to Drive
      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };
      
      const buffer = Buffer.from(pdfBase64, 'base64');
      const media = {
        mimeType: 'application/pdf',
        body: require('stream').Readable.from(buffer),
      };

      const driveFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, iconLink',
      });

      // 3. Create Calendar Event
      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.start,
          timeZone: eventData.timeZone,
        },
        end: {
          dateTime: eventData.end,
          timeZone: eventData.timeZone,
        },
        attachments: [
          {
            fileUrl: driveFile.data.webViewLink,
            title: driveFile.data.name,
            mimeType: 'application/pdf',
            iconLink: driveFile.data.iconLink,
          }
        ],
      };

      const calendarEvent = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        supportsAttachments: true,
      });

      res.json({ 
        success: true, 
        eventUrl: calendarEvent.data.htmlLink,
        driveUrl: driveFile.data.webViewLink 
      });
    } catch (error: any) {
      console.error('Google Workspace Error:', error);
      res.status(500).json({ error: error.message || 'Failed to schedule event' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
