import React, {FC, useCallback, useState} from 'react';

import {NavLink} from 'react-router-dom';
import {CollapseButton} from "@components/DMList/styles";
import {useLocation, useParams} from "react-router";
import {IChannel, IUser} from "@typings/db";
import useSWR from "swr";
import fetcher from "@utils/fetcher";

const ChannelList:FC = () => {
    const {workspace} = useParams<{workspace:string}>();
    const { data:userData, error, revalidate,mutate } = useSWR<IUser>('/api/users', fetcher,{ // 사용자 데이터 가져옴
        dedupingInterval:2000
        /*
            dedupingInterval은 캐시의 유지기간이다.
            dedupingInterval:2000은 2초동안 useSWR로 /api/users을 아무리 많이 요청을 해도 서버에는 딱 한번만 호출한다.
            나머지 것을은 첫번째 요청한 것에 대한 데이터를 그대로 가져온다.
        */
    }); // 세번째 자리(dedupingInterval)는 주기적 호출을 막는다.
    const {data: channelData} = useSWR<IChannel[]>(userData ? `/api/workspaces/${workspace}/channels`:null, fetcher) // 채널 데이터 가져옴
    const location = useLocation();
    // const [socket] = useSocket(workspace);
    const [channelCollapse,setChannelCollapse] = useState(false);
    const [countList, setCountList] = useState<{[key:string]:number | undefined}>({});

    const toggleChannelCopplase = useCallback(()=> {
        setChannelCollapse((prev)=>!prev);
    },[])

    const resetCount = useCallback((id)=> ()=>{
        setCountList((list)=> {
            return{
                ...list,
            [id]:undefined
            }
        })
    },[])

    return(
        <>
            <h2>
                <CollapseButton collapse={channelCollapse} onClick={toggleChannelCopplase}>
                    <i
                        className="c-icon p-channel_sidebar__section_heading_expand p-channel_sidebar__section_heading_expand--show_more_feature c-icon--caret-right c-icon--inherit c-icon--inline"
                        data-qa="channel-section-collapse"
                        aria-hidden="true"
                    />
                </CollapseButton>
                <span>Channels</span>
            </h2>
            <div>
                {!channelCollapse &&
                channelData?.map((channel) => {
                    const count = countList[`c-${channel.id}`];
                    return (
                        <NavLink
                            key={channel.name}
                            activeClassName="selected"
                            to={`/workspace/${workspace}/channel/${channel.name}`}
                            onClick={resetCount(`c-${channel.id}`)}
                        >
                            <span className={count !== undefined && count >= 0 ? 'bold' : undefined}># {channel.name}</span>
                            {count !== undefined && count > 0 && <span className="count">{count}</span>}
                        </NavLink>
                    );
                })}
            </div>
        </>
    )
}

export default ChannelList