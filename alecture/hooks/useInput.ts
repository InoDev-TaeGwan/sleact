import { Dispatch, SetStateAction, useCallback, useState } from "react";

type ReturnType<T = any> = [T, (e: any) => void, Dispatch<SetStateAction<T>>];

// const useInput = <T = any>(initialData: T) : [T, (e: any) => void, Dispatch<SetStateAction<T>>] => {
const useInput = <T = any>(initialData: T) : ReturnType<T> => { // 가독성을 위해 ReturnType<T>으로 변수로 지정
    // 타입스크립트는 변수와, 매개변수, 리턴값에 타입을 넣어준다.
    // 타입스크립트는 변수와 리턴값의 타입을 추론할수있지만, 매개변수는 타입을 꼭 붙여줘야한다.
    // 만약 타입이 뭐가 들어와야할지 모른다면 any를 넣어서 에러를 막던가 <T = any>(initialData: T) : [T, (e: any) => void, Dispatch<SetStateAction<T>>] 이렇게 제너릭을 넣어준다.
    // (initialData: T) 매개변수 타입지정
    // [T, (e: any) => void, Dispatch<SetStateAction<T>>] 이것은 리턴값 타입지정 
    // Dispatch와 SetStateAction은 리액트에서 제공하는 타입이다
    // 먼저 any로 선언을 하고 추후에 제너릭을 공부하고 제너릭으로 바꿔줄 것.

    // 타입스크립트를 사용하면 가독성이 떨어지는건 사실이다. 그러나 안정성을 위해서 타입스크립트를 사용!
    const [value, setValue] = useState(initialData);
    const handler = useCallback((e:any) => {
        setValue(e.target.value);
    },[])
    return [value, handler, setValue];
}

export default useInput;