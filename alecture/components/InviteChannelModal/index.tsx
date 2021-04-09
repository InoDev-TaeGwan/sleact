import React,{ FC, useCallback } from 'react'

import useSWR from 'swr';

import {IUser } from '@typings/db';
import fetcher from '@utils/fetcher';

import Modal from '@components/Modal'
import useInput from '@hooks/useInput'
import {Label, Input, Button} from '@pages/SignUp/styles';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router';

interface Props {
    show: boolean
    onCloseModal: () => void
    setShowInviteChannelModal:(flag:boolean) => void
}

const InviteChannelModal:FC<Props> = ({show, onCloseModal, setShowInviteChannelModal}) => {
    const {workspace,channel} = useParams<{workspace:string, channel:string}>();
    const [newMember, onChangeNewMember, setNewMember] = useInput('');
    const {data: userData} = useSWR<IUser>('/api/users', fetcher);
    const {revalidate: revalidateMembers} = useSWR<IUser[]>(
        userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
        fetcher,
    )

    const onInviteMember = useCallback((e)=>{
            e.preventDefault();
            if(!newMember || !newMember.trim()){ // input 검사
                return;
            }
            axios.post(`/api/workspaces/${workspace}/channels/${channel}/members`, {
                email:newMember
            })
            .then(()=> {
                revalidateMembers();
                setShowInviteChannelModal(false);
                setNewMember('');
            })
            .catch((error)=> {
                console.dir(error);
                toast.error(error.response?.data,{position:'bottom-center'});
            })
        },[workspace, newMember]
    )

    return (
        <Modal show={show} onCloseModal={onCloseModal}>
            <form onSubmit={onInviteMember}>
                <Label id="member-label">
                    <span>채널 멤버 초대</span>
                    <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
                </Label>
                <Button type="submit">초대하기</Button>
            </form>
        </Modal>
    )
}

export default InviteChannelModal
