import axios from 'axios';

const fetcher = (url:string) => axios.get(url,{
    withCredentials:true // 백엔드 서버와 프론트 서버의 포트번호가 달라서 쿠키전달이 안돼서 설정. get에서는 두번째에 넣을것.
}).then((response)=>response.data);

export default fetcher;