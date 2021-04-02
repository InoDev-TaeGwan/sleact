import React,{ FC, useCallback } from 'react'
import axios from 'axios';
import useSWR, { mutate } from 'swr';

import fetcher from '@utils/fetcher';
import { Redirect } from 'react-router';

const Workspace:FC = ({children}) => { //VFC는 children을 안쓰는 컴포넌트의 타입, FC는 children을 쓰는 컴포넌트의 타입
    const {data,error,revalidate,mutate} = useSWR('http://localhost:3095/api/users', fetcher,{
        dedupingInterval:2000, // 2초
        /* 
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 http://localhost:3095/api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다.
        */
    });
    const onLogout = useCallback(()=> {
        axios.post('http://localhost:3095/api/users/logout',null,{
            withCredentials:true // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. post에서는 3번째에 넣을것.
        })
        .then(()=>{
            // revalidate()
            // revalidate()는 SWR을 내가 원할때만 호출하도록 커스텀

            mutate(false,false) 
        })
    },[]);

    if(!data) {
        return(
            <Redirect to="/login" />
        )
    }
    return (
        <div>
            <button onClick={onLogout}>로그아웃</button>
            {children}
        </div>
    )
}

export default Workspace
