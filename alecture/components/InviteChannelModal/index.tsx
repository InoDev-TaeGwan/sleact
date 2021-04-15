import React, {FC, useCallback} from 'react';
import Modal from "@components/Modal";
import {Button, Input, Label} from "@pages/SignUp/styles";
import axios from "axios";
import useInput from "@hooks/useInput";
import {useParams} from "react-router-dom";
import {toast} from "react-toastify";
import useSWR from "swr";
import {IUser} from "@typings/db";
import fetcher from "@utils/fetcher";

interface Props{
    show:boolean;
    onCloseModal:(e:any)=>void;
    setShowInviteChannelModal:(flag:boolean)=>void;
}
const InviteChannelModal:FC<Props> = ({show,onCloseModal,setShowInviteChannelModal}) => {
    const {workspace, channel} = useParams<{workspace:string, channel:string}>();
    const [newMember, onchangeNewMemeber,setNewMember] = useInput('');
    const {data:userData} = useSWR<IUser>('/api/users',fetcher);
    const {revalidate:revalidateMembers} = useSWR<IUser[]>( // 특정 채널에있는 모든 멤버들을 가져옴
        userData && channel ? `/api/workspaces/${workspace}/channels/${channel}/members` : null, fetcher
    )
    const onInviteMember = useCallback((e)=>{
        e.preventDefault();
        if(!newMember || !newMember.trim()) return;
        axios.post(`/api/workspaces/${workspace}/channels/${channel}/members`,{email:newMember})
            .then(()=> {
                revalidateMembers(); // 멤버추가되면 추가된 멤버 포함해서 revalidateMembers
                setShowInviteChannelModal(false);
                setNewMember('')
            })
            .catch((error)=> {
                console.dir(error);
                toast.error(error.response?.data, {position:'bottom-center'});
            })
    },[newMember])
    return(
        <Modal show={show} onCloseModal={onCloseModal}  >
            <form onSubmit={onInviteMember}>
                <Label id="member-label">
                    <span>채널 멤버 초대</span>
                    <Input id="member" value={newMember} onChange={onchangeNewMemeber} />
                </Label>
                <Button type="submit">초대하기</Button>
            </form>
        </Modal>
    )
}

export default InviteChannelModal;