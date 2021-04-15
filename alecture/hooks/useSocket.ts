import React, { useCallback } from 'react';

import io from 'socket.io-client';

const backUrl = 'http://localhost:3095';

const sockets: { [key: string]: SocketIOClient.Socket } = {}; // 여러 워크스페이스에 들어갈수있도록 작업, key는 워크스페이스가 올거임

const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  console.log('rerender', workspace);
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect(); // 연결 종료, 꼭 끊는걸 넣어줘야한다. 만약 채팅중인던 A워크스페이스에서 채팅한뒤 B워크스페이스로 가서 채팅하려고하면 B워크스페이스에 A워크스페이스 채팅기록이 남는다
      delete sockets[workspace]; // 연결을 종료하면 더 이상 관리할 필요없어서 지워버림
    }
  }, [workspace]);

  if (!workspace) {
    return [undefined, disconnect];
  }

  if (!sockets[workspace]) {
    // 기존에 저장한게 없다면
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'], // 웹소켓만 사용!
    });
  }

  // sockets[workspace].emit('hello', 'world'); // hello라는 이름(이벤트명)으로 world라는 데이터(데이터)를 전달
  //
  // // 이벤트 리스너
  // sockets[workspace].on('message', (data) => {
  //   // 새로운 채널 메시지가 올 때
  //   // emit으로 보내면 on으로 받는다. 서버에서 프론트로 데이터가 오면 message(이벤트 이름)에다가 data를 받는다. 이벤트명이 일치할때만 받는다.
  //   console.log(data);
  // });
  // sockets[workspace].on('data', (data) => {
  //   // emit으로 보내면 on으로 받는다. 서버에서 프론트로 데이터가 오면 data(이벤트 이름)에다가 data를 받는다. 이벤트명이 일치할때만 받는다.
  //   console.log(data);
  // });
  // sockets[workspace].on('onlineList', (data) => {
  //   // 현재 온라인인 사람들 아이디 목록
  //   // emit으로 보내면 on으로 받는다. 서버에서 프론트로 데이터가 오면 onlineList(이벤트 이름)에다가 data를 받는다. 이벤트명이 일치할때만 받는다.
  //   console.log(data);
  // });

  return [sockets[workspace], disconnect];
};

export default useSocket;
