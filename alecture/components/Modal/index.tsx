import React,{FC, useCallback} from 'react'

import { CloseModalButton, CreateModal } from './styles';

interface Props { // 타입선언
    show: boolean;
    onCloseModal: (e:any) => void;
}

const Modal: FC<Props> = ({show, children, onCloseModal}) => {
    const stopPropagation = useCallback((e)=> {
        e.stopPropagation(); // 버블링 이벤트 제거
    },[])

    if(!show) {
        return null;
    }
    return (
        <CreateModal onClick={onCloseModal}>
            <div onClick={stopPropagation}>
                <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>
                {children}
            </div>
        </CreateModal>
    )
}

export default Modal
