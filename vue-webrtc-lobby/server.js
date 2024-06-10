const app = require('express')();
let server = {};

if (process.argv[2] && process.argv[2] === '-ssl') {
   var fs = require('fs');
   var options = {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
      requestCert: false,
      rejectUnauthorized: false
   };
   server = require('https').createServer(options, app);
   log('Using https.');
} else {
   server = require('http').createServer(app);
   log('Using http.');
}

const io = require('socket.io')(server, { cors: true, origins: false });
const signalServer = require('simple-signal-server')(io)
const port = process.env.PORT || 3000;
const rooms = new Map()
let pendingUsers = [];
server.listen(port, () => {
   log('Lobby server running on port ' + port);
   console.log('Server is running on port:', port);
});

app.get('/', function (req, res) {
   var sum = 0;
   rooms.forEach((v, k) => sum = sum + v.size);
   res.send('Lobby server<br/>rooms: ' + rooms.size + '<br/>members: ' + sum);
});

signalServer.on('discover', (request) => {
   log('discover');
   let memberId = request.socket.id;
   let roomId = request.discoveryData;
   let members = rooms.get(roomId);
   if (!members) {
      members = new Set();
      rooms.set(roomId, members);
   }
   members.add(memberId);
   request.socket.roomId = roomId;
   request.discover({
      peers: Array.from(members)
   });
   log('joined ' + roomId + ' ' + memberId)
})

signalServer.on('disconnect', (socket) => {
   let memberId = socket.id;
   let roomId = socket.roomId;
   let members = rooms.get(roomId);
   if (members) {
      members.delete(memberId);
   }
   pendingUsers = pendingUsers.filter(user => user.id !== socket.id);
   log('left ' + roomId + ' ' + memberId);
})

signalServer.on('request', (request) => {
   request.forward()
   log('requested')
})

// 处理匹配请求逻辑
io.on('connection', (socket) => {
   socket.on('match', () => {
      // 检查是否有等待匹配的用户
      if (pendingUsers.length > 0) {
         // 随机选择一个待匹配用户
         const randomIndex = Math.floor(Math.random() * pendingUsers.length);
         const partnerSocket = pendingUsers.splice(randomIndex, 1)[0];

         // 创建一个新的房间ID
         const roomId = `room-${socket.id}-${partnerSocket.id}`;

         // 保存房间信息
         const members = new Set([socket.id, partnerSocket.id]);
         rooms.set(roomId, members);

         // 将两位用户加入同一个房间
         socket.join(roomId);
         partnerSocket.join(roomId);

         // 发送房间加入信息
         socket.emit('match-found', { roomId });
         partnerSocket.emit('match-found', { roomId });

         console.log(`Matched ${socket.id} with ${partnerSocket.id} into room ${roomId}`);
      } else {
         // 没有待匹配用户，将当前用户加入待匹配队列
         pendingUsers.push(socket);
         console.log(`${socket.id} added to pending users`);
      }
   });

   // 用户断开连接时从待匹配队列中移除
   socket.on('disconnect', () => {
      pendingUsers = pendingUsers.filter(user => user.id !== socket.id);
      console.log(`${socket.id} disconnected`);
   });
});

function log(message, data) {
   if (true) {
      console.log(message);
      if (data != null) {
         console.log(data);
      }
   }
}
