import dayjs from 'dayjs';
import { IDM } from '@typings/db';

export default function makeSection(chatList: IDM[]) {
  // 채팅리스트를 받아와 그룹화를시켜 보여줌
  const sections: { [key: string]: IDM[] } = {}; // {[key:string]: IDM[]} 빈 배열을 만듬
  chatList.forEach((chat) => {
    const monthDate = dayjs(chat.createdAt).format('YYYY-MM-DD'); // dayjs로 날짜를 추출 후 YYYY-MM-DD로 변환
    if (Array.isArray(sections[monthDate])) {
      sections[monthDate].push(chat);
    } else {
      // 처음만드는 경우
      sections[monthDate] = [chat];
    }
  });
  return sections;
}
