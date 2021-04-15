import React, { useCallback, useEffect, useState, VFC } from 'react';

import { Redirect, Route, Switch, useParams } from 'react-router';
import useSWR from 'swr';
import axios from 'axios';
import gravatar from 'gravatar';
import { Link } from 'react-router-dom';

import fetcher from '@utils/fetcher';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from '@layouts/Workspace/styles';
import loadable from '@loadable/component';
import Menu from '@components/Menu';
import { IUser, IChannel } from '@typings/db';
import Modal from '@components/Modal';
import { Button, Input, Label } from '@pages/SignUp/styles';
import useInput from '@hooks/useInput';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/InviteWorkspaceModal';
import ChannelList from '@components/ChannelList';
import DMList from '@components/DMList';
import useSocket from '@hooks/useSocket';
import { CollapseButton } from '@components/DMList/styles';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const WorkSpace: VFC = () => {
  //VFC는 children을 안쓰는 컴포넌트의 타입, FC는 children을 쓰는 컴포넌트의 타입
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const { data: userData, error, revalidate, mutate } = useSWR<IUser | false>('/api/users', fetcher, {
    // 사용자 데이터 가져옴
    dedupingInterval: 2000,
    /*
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 /api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다.
        */
  }); // 세번째 자리(dedupingInterval)는 주기적 호출을 막는다.
  const { data: channelData } = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels` : null, fetcher); // 채널 데이터 가져옴
  const { data: memberData } = useSWR<IUser[]>(
    userData // 워크스페이스 안에 있는 멤버 데이터 가져옴
      ? `/api/workspaces/${workspace}/members`
      : null,
    fetcher,
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useState(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useState(false);
  const [newWorkspace, onChangeNewWorkspace, setNewWorkspace] = useInput('');
  const [newUrl, onChangeNewUrl, setNewUrl] = useInput('');
  const [socket, disconnect] = useSocket(workspace);

  useEffect(() => {
    if (channelData && userData && socket) {
      // console.log(socket);
      socket.emit('login', { id: userData.id, channels: channelData.map((v) => v.id) });
    }
  }, [socket, channelData, userData]);

  useEffect(() => {
    // 워크스페이스가 바꿜때 연결 끊어줌
    return () => {
      disconnect();
    };
  }, [workspace, disconnect]);

  const onLogout = useCallback((e) => {
    // 함수형 컴포넌트에서 함수를 사용할때는 무조건 useCallback을 사용하자, 그래야 불필요한 리랜더링이 발생안됌.
    e.preventDefault();
    axios
      .post('/api/users/logout', null, {
        withCredentials: true, // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. post에서는 3번째에 넣을것. 쿠키를 서로 공유하기 위해
      })
      .then((response) => {
        // revalidate(); // SWR을 내가 원할떄만 호춯하도록 커스텀,
        mutate(response.data, false);
      });
  }, []);

  const onCloseUserProfile = useCallback((e) => {
    e.stopPropagation(); // 이벤트 버블링 현상 제거
    setShowUserMenu(false);
  }, []);
  const onClickUserProfile = useCallback((e) => {
    e.preventDefault();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback((e) => {
    e.preventDefault();
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return; // 띄어쓰기(공백) 입력후 전송시 띄어쓰기 막음
      if (!newUrl || !newUrl.trim()) return; // 띄어쓰기(공백) 입력후 전송시 띄어쓰기 막음
      setNewWorkspace('');
      setNewUrl('');
      axios
        .post(
          '/api/workspaces',
          { workspace: newWorkspace, url: newUrl },
          {
            withCredentials: true, //withCredentials을 해야 로그인상태라고 서버가 쿠키를 전달해서 알려줌
          },
        )
        .then(() => {
          revalidate(); // revalidate()는 SWR을 내가 원할때만 호출하도록 커스텀
          setShowCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspace, newUrl],
  );

  const onCloseModal = useCallback((e) => {
    e.preventDefault();
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  if (!userData) {
    return <Redirect to="/login" />;
  }
  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.nickname, { s: '28px', d: 'retro' })} alt={userData.nickname} />
            {showUserMenu && (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onCloseUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(userData.nickname, { s: '36px', d: 'retro' })} alt={userData.nickname} />
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
        <Workspaces>
          {userData.Workspaces.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>
        <Chats>
          <Switch>
            <Route path="/workspace/:workspace/:channel/channel" component={Channel} />
            <Route path="/workspace/:workspace/dm/:id" component={DirectMessage} />
          </Switch>
        </Chats>
      </WorkspaceWrapper>
      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>워크스페이스 이름</span>
            <Input id="workspace" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>워크스페이스 url</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">생성하기</Button>
        </form>
      </Modal>
      <InviteWorkspaceModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteChannelModal}
      />
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
    </div>
  );
};

export default WorkSpace;
