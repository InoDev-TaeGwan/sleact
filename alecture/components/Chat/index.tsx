import React, { memo, VFC, useMemo } from 'react';

import { Link } from 'react-router-dom';
import gravatar from 'gravatar';
import dayjs from 'dayjs';
import reqexifyString from 'regexify-string';
import { useParams } from 'react-router';
import { IDM } from '@typings/db';

import { ChatWrapper } from '@components/Chat/styles';

interface Props {
  data: IDM;
}
const Chat: VFC<Props> = ({ data }) => {
  // 부모 컴포넌트가 리랜더링되면 자식컴포넌트도 리랜더링 되는데, memo를 사용하면 부모컴포넌트가 바뀌면 자식컴포넌트의 props가 바뀌지않는다면 자식컴포넌트는 리렌더링이 안됌
  const { workspace } = useParams<{ workspace: string }>();
  const user = data.Sender;

  // 정규표현식
  // @[Elric](7)
  // \d 숫자  +는 1개 이상  ?는 0개 이상  g는 모두찾기  |는 또는  \n은 줄바꿈
  // @[Elric]12](7)
  // +? 는 최대한 적게 찾음

  const result = useMemo(
    () =>
      reqexifyString({
        input: data.content,
        pattern: /@\[(.+?)]\((\d+?)\)|\n/g,
        decorator(match, index) {
          // 패턴 매칭
          const arr: string[] | null = match.match(/@\[(.+?)]\((\d+?)\)/)!;
          if (arr) {
            return (
              <Link key={match + index} to={`/workspace/${workspace}/dm/${arr[2]}`}>
                @{arr[1]}
              </Link>
            );
          }
          return <br key={index} />;
        },
      }),
    [data.content],
  );

  return (
    <ChatWrapper>
      <div className="chat-img">
        <img src={gravatar.url(user.email, { s: '36px', d: 'retro' })} alt={user.nickname} />
      </div>
      <div className="chat-text">
        <div className="chat-user">
          <b>{user.nickname}</b>
          <span>{dayjs(data.createdAt).format('h:mm:A')}</span>
        </div>
        <p>{result}</p>
      </div>
    </ChatWrapper>
  );
};

export default memo(Chat);
