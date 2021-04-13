import React, {FC, useCallback, useEffect, useState} from 'react';

import {NavLink} from "react-router-dom";

import {CollapseButton} from "@components/DMList/styles";
import {IDM, IUser, IUserWithOnline} from "@typings/db";
import {useParams} from "react-router";
import useSWR from "swr";
import fetcher from "@utils/fetcher";

const DMList:FC = () => {
    const {workspace} = useParams<{workspace? :string}>();
    const { data:userData, error, revalidate,mutate } = useSWR<IUser>('/api/users', fetcher,{ // 사용자 데이터 가져옴
        dedupingInterval:2000
        /*
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 /api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다.
        */
    }); // 세번째 자리(dedupingInterval)는 주기적 호출을 막는다.
    const {data:memberData} = useSWR<IUserWithOnline[]>(
        userData ? `/api/workspaces/${workspace}/members` : null, fetcher);
    // const [socket] = useSocket(workspace);
    const [channelCollapse,setChannelCollapse] = useState(false);
    const [countList,setCountList] = useState<{ [key: string]: number }>({});
    const [onlineList,setOnlineList] = useState<number[]>([]);

    const toggleChannelCollapse = useCallback(()=> {
        setChannelCollapse((prev)=>!prev);
    }, [])

    const resetCount = useCallback(
        (id)=>() => {
            setCountList((list)=> {
                return{
                    ...list,
                    [id]:0
                }
            })
        },[]
    )

    const onMessage = (data:IDM) => {
        console.log('dm왔다', data) ;
        setCountList((list)=> {
            return{
                ...list,
                [data.SenderId] : list[data.SenderId] ? list[data.SenderId] + 1 : 1,
            }
        })
    }

    useEffect(()=> {
        console.log("DMList : workspace 바꼈다", workspace);
        setOnlineList([]);
        setCountList({});
    }, [workspace])

    return(
        <>
            <h2>
                <CollapseButton collapse={channelCollapse} onClick={toggleChannelCollapse}>
                    <i
                        className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
                        data-qa="channel-section-collapse"
                        aria-hidden="true"
                    />
                </CollapseButton>
                <span>Direct Messages</span>
            </h2>
            <div>
                {!channelCollapse && memberData?.map((member)=> {
                    const isOnline = onlineList.includes(member.id);
                    const count = countList[member.id] || 0;
                    return(
                        <NavLink key={member.id} activeClassName="selected" to={`/workspace/${workspace}/dm/${member.id}`} onClick={resetCount(member.id)}>
                            <i
                                className={`c-icon p-channel_sidebar__presence_icon p-channel_sidebar__presence_icon--dim_enabled c-presence ${
                                    isOnline ? 'c-presence--active c-icon--presence-online' : 'c-icon--presence-offline'
                                }`}
                                aria-hidden="true"
                                data-qa="presence_indicator"
                                data-qa-presence-self="false"
                                data-qa-presence-active="false"
                                data-qa-presence-dnd="false"
                            />
                            <span className={count > 0 ? 'bold' : undefined}>{member.nickname}</span>
                            {member.id === userData?.id && <span>(나)</span>}
                            {count > 0 && <span className="count">{count}</span>}
                        </NavLink>
                    )
                })}
            </div>
        </>
    )
}

export default DMList;