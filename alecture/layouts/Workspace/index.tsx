import React,{ VFC, useCallback, useState } from 'react'
import { Redirect, Switch, Route, useParams, } from 'react-router';
import {Link} from "react-router-dom";
import axios from 'axios';
import useSWR, { mutate } from 'swr';
import gravatar from 'gravatar';
import { toast } from 'react-toastify';

import { IUser,IChannel } from '@typings/db';

import useInput from '@hooks/useInput';
import loadable from '@loadable/component';
import fetcher from '@utils/fetcher';


import {Input,Label,Button} from '@pages/SignUp/styles';
import { Header, ProfileImg, RightMenu, WorkspaceWrapper ,Workspaces, WorkspaceName, Channels, Chats, MenuScroll,ProfileModal,LogOutButton,WorkspaceButton,AddButton,WorkspaceModal } from './styles'; 

import Menu from '@components/Menu';
import Modal from '@components/Modal';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import InviteChannelModal from '@components//InviteChannelModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';


const Channel = loadable(()=> import('@pages/Channel'));
const DirectMessage = loadable(()=> import ('@pages/DirectMessage'));

const Workspace:VFC = () => { //VFC는 children을 안쓰는 컴포넌트의 타입, FC는 children을 쓰는 컴포넌트의 타입
    const [showUserMenu,setShowUserMenu] = useState(false);
    const [showCreateWorkspaceModal,setShowCreateWorkspaceModal] = useState(false);
    const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false)
    const [showInviteChannelModal, setShowInviteChannelModal] = useState(false)
    const [showWorkspaceModal,setShowWorkspaceModal] = useState(false);
    const [showCreateChannelModal,setShowCreateChannelModal] = useState(false);
    const [newWorkspace, onChangeNewWorkspace , setNewWorkpsace] = useInput('');
    const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');

    const {workspace} = useParams<{workspace: string}>();

    const {data:userData,error,revalidate,mutate} = useSWR<IUser | false>('/api/users', fetcher,{
        dedupingInterval:2000, // 2초
        /* 
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 /api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다. 
        */
    });

    const {data: channelData} = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher);

    const {data: memberData} = useSWR<IUser[]>(
        userData ? `/api/workspaces/${workspace}/members` : null,
        fetcher,
    )


    const onLogout = useCallback(()=> { // 함수형 컴포넌트에서 함수를 사용할때는 무조건 useCallback을 사용하자, 그래야 불필요한 리랜더링이 발생안됌.
        axios.post('/api/users/logout',null,{
            withCredentials:true // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. post에서는 3번째에 넣을것.
        })
        .then(()=>{
            // revalidate()
            // revalidate()는 SWR을 내가 원할때만 호출하도록 커스텀

            mutate(false,false) 
        })
    },[]);

    const onCloseUserProfile = useCallback((e)=> {
        // console.log("밖에쪽")
        e.stopPropagation(); // 이벤트 버블링 현상 제거
        setShowUserMenu(false);
    },[])

    const onClickUserProfile = useCallback(()=> { // 메뉴 토글 
        // console.log("안쪽")
        setShowUserMenu((prev)=>!prev);
    },[])

    const onClickCreateWorkSpace = useCallback(()=> {
        setShowCreateWorkspaceModal(true)
    },[])

    const onCreateWorkspace = useCallback((e)=> {
        e.preventDefault();
        if(!newWorkspace || !newWorkspace.trim()) return; // trim을 사용하여 꼭 띄어쓰기까지 검사해야함! 
        if(!newUrl || !newUrl.trim()) return;

        axios.post('/api/workspaces', {
            workspace:newWorkspace,
            url: newUrl
        },{
            withCredentials:true // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. post에서는 3번째에 넣을것.
        })
        .then(()=> {
            revalidate();
            setShowCreateWorkspaceModal(false);
            setNewWorkpsace('');
            setNewUrl('');
        })
        .catch((error) => {
            console.dir(error);
            toast.error(error.response?.data, {position: 'bottom-center'});
        })

    },[newWorkspace, newUrl])

    const onCloseModal = useCallback(()=> {
        setShowCreateWorkspaceModal(false);
        setShowCreateChannelModal(false);
        setShowInviteWorkspaceModal(false);
        setShowInviteChannelModal(false);
    },[])

    const toggleWorkspaceModal = useCallback(()=> {
        setShowWorkspaceModal((prev)=>!prev);
    },[])

    const onClickAddChannel = useCallback(()=> { // 채널 만들기
        setShowCreateChannelModal(true);
    }, [])
    
    const onClickInviteWorkspace = useCallback(()=> {
        setShowInviteWorkspaceModal(true);
    }, [])

    if(!userData) {
        return(
            <Redirect to="/login" />     
        )
    }
    return (
        <div>
            <Header> 
                <RightMenu>
                    <span onClick={onClickUserProfile}>  {/* close 버블링 버그 발견 추후 해결... */}
                        <ProfileImg src={gravatar.url(userData.nickname, {s:'28px', d:'retro' }) } alt={userData.nickname} />
                        {showUserMenu && (
                            <Menu style={{right:0, top:38}} show={showUserMenu} onCloseModal={onCloseUserProfile}>
                                <ProfileModal>
                                    <img src={gravatar.url(userData.nickname, {s:'36px', d:'retro' }) } alt={userData.nickname} />
                                    <div>
                                        <span id="profile-name">{userData.nickname}</span>
                                        <span id="profile-active">Active</span>
                                    </div>
                                </ProfileModal>
                                <LogOutButton onClick={onLogout}>로그아웃</LogOutButton>
                            </Menu>
                        )}
                    </span>
                </RightMenu>
            </Header>
            <WorkspaceWrapper>
                <Workspaces>{
                    userData?.Workspaces.map((ws)=> {
                        return(
                            <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                                <WorkspaceButton>
                                    {ws.name.slice(0,1).toUpperCase()}
                                </WorkspaceButton>
                            </Link>
                        )
                    })
                }
                    <AddButton onClick={onClickCreateWorkSpace}>+</AddButton>
                </Workspaces>
                <Channels>
                    <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
                    <MenuScroll>
                        <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{top: 95, left: 80}}>
                            <WorkspaceModal>
                                <h2 >Sleact</h2>
                                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용한 초대</button>
                                <button onClick={onClickAddChannel}>채널 만들기</button>
                                <button onClick={onLogout}>로그아웃</button>
                            </WorkspaceModal>
                        </Menu>
                        <ChannelList />
                        <DMList  />

                    </MenuScroll>
                </Channels>
                <Chats>               
                    <Switch>
                        <Route path="/workspace/:workspace/channel/:channel" component={Channel} /> 
                        <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
                    </Switch>
                </Chats>
            </WorkspaceWrapper>
            <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
                <form onSubmit={onCreateWorkspace}>
                    <Label id="workspace-label">
                        <span>워크스페이스 이름</span>
                        <Input  id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
                    </Label>
                    <Label id="workspace-url-label">
                        <span>워크스페이스 url</span>
                        <Input  id="workspace" value={newUrl} onChange={onChangeNewUrl} />
                    </Label>
                    <Button type="submit">생성하기</Button>
                </form>
            </Modal>
            <CreateChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} setShowCreateChannelModal={setShowCreateChannelModal}  />
            <InviteWorkspaceModal show={showInviteWorkspaceModal} onCloseModal={onCloseModal} setShowInviteWorkspaceModal={setShowInviteWorkspaceModal} />
            <InviteChannelModal show={showInviteChannelModal} onCloseModal={onCloseModal} setShowInviteChannelModal={setShowInviteChannelModal} />
        </div>
    )
}

export default Workspace
