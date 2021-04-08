import React,{ CSSProperties, FC } from 'react'
import { useCallback } from 'react'
import { CloseModalButton, CreateMenu } from './styles'

interface Props { // props를 전달할떄는 타입을 꼭 지정해야한다.
    show: boolean;
    onCloseModal: (e:any)=> void;  // 주어진 표현식을 평가하고 undefined를 반환
    style: CSSProperties;
    closeButton?: boolean;
}
const Menu:FC<Props> = ({children, style, show, onCloseModal,closeButton}) => {
    const stopPropagation = useCallback((e)=> {
        e.stopPropagation() // 이벤트 객체의 버블링을 제거해줌
    },[])
    if(!show) return null;
    return (
        <CreateMenu onClick={onCloseModal}>
            <div style={style} onClick={stopPropagation}>
                {closeButton && <CloseModalButton onClick={onCloseModal}>&times;</CloseModalButton>}
                {children}
            </div>
        </CreateMenu>
    )
}

Menu.defaultProps = {
    closeButton: true
}

export default Menu
