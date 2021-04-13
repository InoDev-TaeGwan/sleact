import React, {useCallback} from 'react';

import {useParams} from "react-router-dom";
import useSWR from "swr";
import gravatar from 'gravatar';

import {Container, Header} from "@pages/DirectMessage/styles";
import fetcher from "@utils/fetcher";
import ChatList from "@components/ChatList";
import ChatBox from "@components/ChatBox";
import useInput from "@hooks/useInput";
import axios from "axios";
import {useSWRInfinite} from "swr/esm";
import {IDM} from "@typings/db";

const DirectMessage = () => {
    const {workspace, id} = useParams<{workspace:string, id:string}>();
    const {data:userData} = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
    const {data:myData} = useSWR(`/api/users`, fetcher);
    const {data:chatData, mutate:mutateChat,revalidate} = useSWR<IDM[]>( // 채팅 받아오는 API
        `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`, fetcher
    )
    const [chat,onChangeChat,setChat] = useInput('');

    const onSubmitForm = useCallback((e)=> {
        e.preventDefault();
        console.log(chat);
        setChat('');
        if(chat?.trim()) {
            axios.post(`/api/workspaces/${workspace}/dms/${id}/chats`,{content:chat})
                .then(()=> {
                    revalidate();
                    setChat('');
                })
                .catch((error)=> {
                    console.dir(error)
                })
        }
    },[chat])

    if(!userData || !myData) {
        return <div>로딩중...</div>
    }

    return(
        <Container>
            <Header>
                <img src={gravatar.url(userData.email, {s:'24px', d: 'retro'})} alt={userData.nickname} />
                <span>{userData.nickname}</span>
            </Header>
            <ChatList />
            <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
        </Container>
    )
}

export default DirectMessage;