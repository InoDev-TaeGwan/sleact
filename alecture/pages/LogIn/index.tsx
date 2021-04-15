import React, { useCallback, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';
import useSWR from 'swr';

import useInput from '@hooks/useInput';
import fetcher from '@utils/fetcher';

import { Form, Label, Input, LinkContainer, Header, Error, Button } from '@pages/SignUp/styles';

const LogIn = () => {
  // SWR은 get요청에 대한 정보를 저장한다.(redux를 대체하기 위해 사용)
  // get이 아닌 post요청도 저장이 가능하다. 통상적으로 get요청에 많이 사용
  // 로그인할때 post를 요청받는다면 get으로도 한번 더 요청!
  const { data, error, revalidate, mutate } = useSWR('/api/users', fetcher);
  // const {data,error,revalidate} = useSWR('/api/users', fetcher,{
  //     dedupingInterval:100000, // 100초마다 한번
  // });
  // 로그인 후 데이터를 전해줄 api, fetcher함수는 api를 어떻게할지 정해줌 url이 fetcher로 넘어감
  // error는 존재할 수 있지만 기본적으로 data가 존재하지 않으면 loading중이다.
  // revalidate()는 SWR을 내가 원할때만 호출하도록 커스텀
  // 세번째 자리는 주기적 호출을 막는다.
  // dedupingInterval는 호출 초를 늘려줌

  // revalidate는 서버에 요청을 다시 보내서 데이터를 다시 가져옴
  // mutate는 서버에 요청 안보내고 데이터를 수정
  const [email, onChangeEmail] = useInput('');
  const [password, onChangePassword] = useInput('');
  const [loginError, setLoginError] = useState(false);
  const onSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setLoginError(false);
      axios
        .post(
          '/api/users/login',
          { email, password },
          {
            withCredentials: true, // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. post에서는 3번째에 넣을것.
          },
        )
        .then((respone) => {
          revalidate(); // 로그인 성공할때 fetcher 실행, revalidate가 실행되면 리랜더링됨
        })
        .catch((error) => {
          setLoginError(error.response?.data?.statusCode === 401);
        })
        .finally(() => {});
    },
    [email, password],
  );

  if (data === undefined) {
    // 잠깐이라도 페이지가 보이기 싫다면, 백엔드가 data가 flase인 경우가 있어서 !data 사용하면안됌
    return <div>로딩중...</div>;
  }

  if (data) {
    // 로그인을 하면 data가 false에서 -> data에 로그인정보가 담아질때 함수 실행
    return <Redirect to="/workspace/sleact/channel/일반" />;
  }

  return (
    <div id="container">
      <Header>Sleact</Header>
      <Form onSubmit={onSubmit}>
        <Label id="email-label">
          <span>이메일 주소</span>
          <div>
            <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
          </div>
        </Label>
        <Label id="email-label">
          <span>비밀번호</span>
          <div>
            <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
          </div>
          {loginError && <Error>이메일과 비밀번호 조합이 일치하지 않습니다.</Error>}
        </Label>
        <Button type="submit">로그인</Button>
      </Form>
      <LinkContainer>
        아직 회원이 아니신가요?&nbsp;
        <Link to="/signup">회원가입 하러가기</Link>
      </LinkContainer>
    </div>
  );
};

export default LogIn;
