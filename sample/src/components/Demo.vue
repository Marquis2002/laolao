<template>
  <div class="container">
      <div class="row">
          <div class="col-md-12 my-3">
              <h2>唠唠随机视频聊天</h2>
              <input v-model="roomId">
          </div>
      </div>
      <div class="row">
          <div class="col-md-12">
              <div class="col-md-12 vh-100">
                  <vue-webrtc ref="webrtc"
                              camera-height="480"
                              width="200%"
                              :roomId="roomId"
                              :socketUrl="socketUrl"
                              :enableLogs="true"
                              v-on:joined-room="logEvent"
                              v-on:left-room="logEvent"
                              v-on:opened-room="logEvent"
                              v-on:share-started="logEvent"
                              v-on:share-stopped="logEvent"
                              @error="onError" />
              </div>
              <div class="row">
                  <div class="col-md-12 my-3">
                      <button type="button" class="btn btn-primary" @click="onJoin">加入房间</button>
                      <button type="button" class="btn btn-primary" @click="onLeave">离开房间</button>
                      <button type="button" class="btn btn-primary" @click="onCapture">捕捉瞬间</button>
                      <button type="button" class="btn btn-primary" @click="onShareScreen">屏幕共享</button>
                      <button type="button" class="btn btn-primary" @click="requestMatch">进行随机匹配</button>
                    <div v-if="matching">正在匹配中... </div>
                    <div v-else-if="roomId">匹配成功</div>

                  </div>
              </div>
          </div>
      </div>
      <div class="row">
          <div class="col-md-12">
              <h2>Captured Image</h2>
              <figure class="figure">
                  <img :src="img" class="img-responsive" />
              </figure>
          </div>
      </div>
  </div>
</template>

<script>
  import { VueWebRTC } from 'vue-webrtc';
  import io from 'socket.io-client';

  export default {
      name: 'demo-component',
      components: {
          'vue-webrtc': VueWebRTC
      },
      data() {
          return {
              matching: false,
              img: null,
              roomId: "public-room-v3",
              socketUrl:"http://localhost:3000",
              socket: null
          };
      },
      mounted: function () {
        this.initSocket();
        this.matching = true;
      },
      computed: {
      },
      watch: {
      },
      methods: {
        initSocket() {
          this.socket = io('http://localhost:3000');  // 请根据你的服务器地址进行修改
          this.socket.on('connect', () => {
            console.log('Connected to the server');
          });

          // 处理匹配成功事件
          this.socket.on('match-found', (data) => {
            console.log('Match found, room ID:', data.roomId);
            this.roomId = data.roomId;
            this.matching = false;
            this.onJoin();  // 自动加入新匹配到的房间
          });
        },
          requestMatch() {
              this.socket.emit('match');
              this.matching=true;
          },
          onCapture() {
              this.img = this.$refs.webrtc.capture();
          },
          onJoin() {
              this.$refs.webrtc.join();
          },
          onLeave() {
              this.$refs.webrtc.leave();
          },
          onShareScreen() {
              this.img = this.$refs.webrtc.shareScreen();
          },
          onError(error, stream) {
              console.log('On Error Event', error, stream);
          },
          logEvent(event) {
              console.log('Event : ', event);
          },
      }
  };
</script>

<style>
  .btn {
     margin-right: 8px;
  }
</style>