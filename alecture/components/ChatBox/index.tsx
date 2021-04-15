import React, { useCallback, useEffect, useRef, VFC } from 'react';

import autosize from 'autosize';

import { ChatArea, EachMention, MentionsTextarea, SendButton, Toolbox, Form } from '@components/ChatBox/styles';
import { Mention, SuggestionDataItem } from 'react-mentions';
import useSWR from 'swr';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router-dom';
import gravatar from 'gravatar';

interface Props {
  chat: string;
  onSubmitForm: (e: any) => void;
  onChangeChat: (e: any) => void;
  placeholder?: string;
}

const ChatBox: VFC<Props> = ({ chat, onSubmitForm, onChangeChat, placeholder }) => {
  const { workspace } = useParams<{ workspace: string }>();
  const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>('/api/users', fetcher, {
    // 사용자 데이터 가져옴
    dedupingInterval: 2000,
    /*
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 /api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다.
        */
  }); // 세번째 자리(dedupingInterval)는 주기적 호출을 막는다.
  const { data: memberData } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // 타입스크립트에서 Ref 적용
  useEffect(() => {
    if (textareaRef.current) {
      autosize(textareaRef.current);
    }
  }, []);
  const onKeydownChat = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        // Enter키 전송
        if (!e.shiftKey) {
          // Enter + shift 줄바꿈
          e.preventDefault();
          onSubmitForm(e);
        }
      }
    },
    [onSubmitForm],
  );

  const renderSuggestion = useCallback(
    (
      suggestion: SuggestionDataItem,
      search: string,
      highlightedDisplay: React.ReactNode,
      index: number,
      focus: boolean,
    ): React.ReactNode => {
      if (!memberData) return; // 데이터 로딩중에는 아무것도 안보여줌.
      return (
        <EachMention focus={focus}>
          <img
            src={gravatar.url(memberData[index].email, { s: '20px', d: 'retro' })}
            alt={memberData[index].nickname}
          />
          <span>{highlightedDisplay}</span>
        </EachMention>
      );
    },
    [memberData],
  );

  return (
    <ChatArea>
      <Form onSubmit={onSubmitForm}>
        <MentionsTextarea
          id="editor-chat"
          value={chat}
          onChange={onChangeChat}
          onKeyPress={onKeydownChat}
          placeholder={placeholder}
          inputRef={textareaRef}
          allowSuggestionsAboveCursor
        >
          <Mention
            appendSpaceOnAdd
            trigger="@"
            data={memberData?.map((v) => ({ id: v.id, display: v.nickname })) || []}
            renderSuggestion={renderSuggestion}
          />
          {/* appendSpaceOnAdd는 태그를하면 한깐 띄움, trigger는 태그 뭘로할지 */}
        </MentionsTextarea>
        <Toolbox>
          <SendButton
            className={
              'c-button-unstyled c-icon_button c-icon_button--light c-icon_button--size_medium c-texty_input__button c-texty_input__button--send' +
              (chat?.trim() ? '' : ' c-texty_input__button--disabled')
            }
            data-qa="texty_send_button"
            aria-label="Send message"
            data-sk="tooltip_parent"
            type="submit"
            disabled={!chat?.trim()}
          >
            <i className="c-icon c-icon--paperplane-filled" aria-hidden="true" />
          </SendButton>
        </Toolbox>
      </Form>
    </ChatArea>
  );
};

export default ChatBox;
