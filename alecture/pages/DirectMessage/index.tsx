import React, { useCallback, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';
import useSWR, { useSWRInfinite } from 'swr';
import gravatar from 'gravatar';

import { Container, Header } from '@pages/DirectMessage/styles';
import fetcher from '@utils/fetcher';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useInput from '@hooks/useInput';
import axios from 'axios';
import { IDM } from '@typings/db';
import makeSection from '@utils/makeSection';
import Scrollbars from 'react-custom-scrollbars';
import useSocket from '@hooks/useSocket';

const DirectMessage = () => {
  const { workspace, id } = useParams<{ workspace: string; id: string }>();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { data: chatData, mutate: mutateChat, revalidate, setSize } = useSWRInfinite<IDM[]>( // 채팅 받아오는 API, setSize는 페이지수를 바꿔줌, useSWRInfinite 를 사용하면 2차원 배열로 만들어짐
    (index) => `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=${index + 1}`,
    fetcher,
  );
  const [socket] = useSocket(workspace);

  // infinite 스크롤링 할때 아래 두개 변서 선언하면 좋음
  const isEmpty = chatData?.[0]?.length === 0; // 데이터를 가져오는데 데이터가 비어있을때
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false; // 마지막 페이지 데이터가 20개 이하일떄

  const scrollbarRef = useRef<Scrollbars>(null);

  const [chat, onChangeChat, setChat] = useInput('');

  // 옵티미스틱UI는 서버는 안다녀왔지만 마치 성공해서 데이터가 있는 것처럼 만들어 줘야한다
  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      // console.log(chat);
      setChat('');
      if (chat?.trim() && chatData) {
        // 먼저 요청한뒤 서버에 보내고 revalidate
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            SenderId: myData.id, // 보낸사람 아이디
            Sender: myData, // 보낸사람 정보
            ReceiverId: userData.id, // 받는사람 아이디
            Receiver: userData, // 받는사람 정보
            createdAt: new Date(), // 생성시간
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef.current?.scrollToBottom(); // 채팅 쳤을때
        });
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, { content: chat })
          .then(() => {
            revalidate();
          })
          .catch((error) => {
            console.dir(error);
          });
      }
    },
    [chat, chatData, myData, userData, workspace, id],
  );

  useEffect(() => {
    console.log(scrollbarRef.current);
    if (chatData?.length === 1) {
      // chatData가 있으면
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  const onMessage = useCallback((data: IDM) => {
    // id는 상대방 아이디
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      // 내 아이디가 아닌경우
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getScrollHeight() + scrollbarRef.current.getScrollTop() + 150 // 스크롤바 위치가 150미만으로 올렸을때는 메세지가 오면 스크롤바를 아래로 내림, 그 이외에는 무시
          ) {
            console.log('scrollToBottom!', scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 50);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    socket?.on('dm', onMessage);
    return () => {
      socket?.off('dm', onMessage);
    };
  }, [socket, onMessage]);

  if (!userData || !myData) {
    return <div>로딩중...</div>;
  }

  const chatSections = makeSection(chatData ? chatData.flat().reverse() : []); // 2차원 배열을 1차원 배열로 바꾸고 역순으로 정렬

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData.email, { s: '24px', d: 'retro' })} alt={userData.nickname} />
        <span>{userData.nickname}</span>
      </Header>
      <ChatList
        chatSections={chatSections}
        scrollRef={scrollbarRef}
        setSize={setSize}
        isEmpty={isEmpty}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default DirectMessage;
