import React, { useCallback, useState } from 'react';
import {Link, Redirect} from 'react-router-dom';
import axios from 'axios';

import useInput from '@hooks/useInput';

import {Form, Label, Input, LinkContainer, Header, Error, Success, Button} from './styles';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';

const SignUp = () => {
    const {data,error,revalidate} = useSWR('http://localhost:3095/api/users', fetcher);
    const [email,onChangeEmail] = useInput(''); // custom Hooks, setValue 사용안하기 때문에 지움
    const [nickname, onChangeNickname] = useInput(''); // custom Hooks, setValue 사용안하기 때문에 지움
    const [password, _1, setPassword] = useInput(''); // useInput custom Hooks에서 순서가 value, handler, setValue 이다 handler는 따로 처리하기때문에 다른변수로 설정해주면된다. 단 겹치지 말것.
    const [passwordCheck, _2, setPasswordCheck] = useInput('');
    const [signUpError, setSignUpError] = useState('');
    const [signUpSuccess,setSignUpSuccess] = useState(false);
    const [mismatchError,setMismatchError] = useState(false);

    const onChangePassword = useCallback((e) => {
        setPassword(e.target.value)
        setMismatchError(e.target.value !== passwordCheck);
    }, [passwordCheck]);

    const onChangePasswordCheck = useCallback((e) => {
        setPasswordCheck(e.target.value)
        setMismatchError(e.target.value !== password);
    }, [password]); 

    const onSubmit = useCallback((e)=> {
        e.preventDefault();
        console.log(email, nickname, password, passwordCheck)
        if(!mismatchError) {
            console.log('서버로 회원가입하기')
            setSignUpError('');
            setSignUpSuccess(false);
            // 비동기 요청할때 then, catch, finally에 setState를 하는 것들이 있다. 이런 것들을 비동기 요청하기 전에 초기화 해주고 요청하는게 좋음
            axios.post('http://localhost:3095/api/users',{ // 'http://localhost:3095/api/users는 프론트서버 3090에서 3095로 보내는 것이고 만약 뒤에 http://localhost:3095가 없다면 3095에서 3095로 보내는 것이다(webpack devserver proxy설정)
                email,
                nickname,
                password
            })
            .then((response)=>{
                setSignUpSuccess(true);
                console.log(response)
            }) // 성공
            .catch((error)=>{
                console.log(error.response)
                // setSignUpError(true)
                setSignUpError(error.response.data)
            }) // 실패
            .finally(()=>{}) // 무조건 실행
        }
    }, [email, nickname, password, passwordCheck,mismatchError]); // 함수안에서 쓰이는 변수들(state들)을 다 넣어야 값이 업데이트 된다, 안 그럼 항상 같은 함수가 유지된다.

    if(data === undefined) { // 잠깐이라도 페이지가 보이기 싫다면, 백엔드가 data가 flase인 경우가 있어서 !data 사용하면안됌
        return <div>로딩중...</div>
    }

    if(data) { // 로그인을 하면 data가 false에서 -> data에 로그인정보가 담아질때 함수 실행 / 로그인 상태에서 회원가입페이지로 들어오면 /workspace/channel 로 전환
        return <Redirect to="/workspace/sleact/channel/일반" />
    }

    return (
        <div id="continer">
            <Header>Selact</Header>
            <Form onSubmit={onSubmit}>
                <Label id="email-label">
                    <span>이메일 주소</span>
                    <div>
                        <Input type="email" id="email" name="email" value={email} onChange={onChangeEmail} />
                    </div>
                </Label>
                <Label id="nickname-label">
                    <span>닉네임</span>
                    <div>
                        <Input type="text" id="nickname" name="nickname" value={nickname} onChange={onChangeNickname} />
                    </div>
                </Label>
                <Label id="password-label">
                    <span>비밀번호</span>
                    <div>
                        <Input type="password" id="password" name="password" value={password} onChange={onChangePassword} />
                    </div>
                </Label>
                <Label id="password-check-label">
                    <span>비밀번호 확인</span>
                    <div>
                        <Input type="password" id="password-check" name="password-check" value={passwordCheck} onChange={onChangePasswordCheck} />
                    </div>
                    {mismatchError && <Error>비밀번호가 일치하지 않습니다.</Error>}
                    {!nickname && <Error>닉네임을 입력해주세요.</Error>}
                    {/* {signUpError && <Error>이미 가입된 이메일입니다.</Error>} */}
                    {signUpError && <Error>{signUpError}</Error>}
                    {signUpSuccess && <Success>회원가입되었습니다! 로그인해주세요.</Success>}
                </Label>
                <Button type="submit">회원가입</Button>
                <LinkContainer>
                    이미 회원이신가요? &nbsp;
                    <Link to="/login">
                        로그인 하러가기
                    </Link>
                </LinkContainer>
            </Form>
        </div>
    )
}

export default SignUp
