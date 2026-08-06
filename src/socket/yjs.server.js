const { setupWSConnection, setPersistence, docs } = require("y-websocket/bin/utils");
const Y = require("yjs");
const prisma = require("../config/prisma");
const logger = require("../config/logger");

const WebSocket = require('ws');

// Setup persistence
setPersistence({
  bindState: async (docName, ydoc) => {
    // docName is the document ID
    try {
      const document = await prisma.document.findUnique({
        where: { id: docName },
      });

      if (document && document.yjsState) {
        // Load existing state from DB
        Y.applyUpdate(ydoc, document.yjsState);
      }
    } catch (error) {
      logger.error(`[Yjs] Error loading document state for ${docName}:`, error);
    }
  },
  writeState: async (docName, ydoc) => {
    try {
      // Save state to DB
      const state = Y.encodeStateAsUpdate(ydoc);
      const stateBuffer = Buffer.from(state);
      
      await prisma.document.update({
        where: { id: docName },
        data: { yjsState: stateBuffer },
      });
    } catch (error) {
      logger.error(`[Yjs] Error saving document state for ${docName}:`, error);
    }
  },
});

const yjsWebsocketServer = new WebSocket.Server({ noServer: true });

yjsWebsocketServer.on('connection', (ws, req) => {
  // Extract document ID from path. Assuming /yjs/documentId
  const urlParts = req.url.split('/');
  const docName = urlParts[urlParts.length - 1];
  
  logger.info(`[Yjs] Client connected to document: ${docName}`);
  
  // Setup the WS connection with Yjs
  setupWSConnection(ws, req, { docName });
});

module.exports = { yjsWebsocketServer };
