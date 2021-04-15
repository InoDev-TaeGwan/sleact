import React, { useCallback, useRef, VFC, forwardRef, ForwardedRef, RefObject } from 'react';

import { ChatZone, Section, StickyHeader } from '@components/ChatList/styles';
import { IDM } from '@typings/db';
import Chat from '@components/Chat';
import Scrollbars from 'react-custom-scrollbars';

interface Props {
  chatSections: { [key: string]: IDM[] };
  setSize: (f: (size: number) => number) => Promise<IDM[][] | undefined>;
  isEmpty: boolean;
  isReachingEnd: boolean;
  scrollRef: RefObject<Scrollbars>;
}

const ChatList: VFC<Props> = ({ chatSections, setSize, scrollRef, isReachingEnd }) => {
  const onScroll = useCallback((values) => {
    if (values.scrollTop === 0 && !isReachingEnd) {
      console.log('가장 위');
      // 데이터 추가 로딩
      setSize((prevSize) => prevSize + 1) // 과거 데이터를 새로운 데이터 기반으로 바꿀수있음, 스크롤이 가장 위로 올라가면 페이지를 하나 더 생성
        .then(() => {
          // 스크롤 위치 유지
          if (scrollRef?.current) {
            scrollRef.current?.scrollTop(scrollRef.current?.getScrollHeight() - values.scrollHeight); // 현재 스크롤바 위치 - 스크롤바 크기
          }
          console.log(scrollRef.current?.getScrollHeight(), values.scrollHeight);
        });
    }
  }, []);
  return (
    <ChatZone>
      <Scrollbars autoHide ref={scrollRef} onScrollFrame={onScroll}>
        {Object.entries(chatSections).map(([date, chats]) => {
          //Object.entries()는 객체를 배열로 바꿈
          return (
            <Section className={`section-${date}`} key={date}>
              <StickyHeader>
                <button>{date}</button>
              </StickyHeader>
              {chats.map((chat) => (
                <Chat key={chat.id} data={chat} />
              ))}
            </Section>
          );
        })}
      </Scrollbars>
    </ChatZone>
  );
};

export default ChatList;
