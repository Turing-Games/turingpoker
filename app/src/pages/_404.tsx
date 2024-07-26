import GameClient from '@app/components/GameClient';
import Main from '@app/layouts/main';
import { Heading } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';


export default function _404() {

  return (
    <Main pageTitle='Page Not Found'>
      <div className="flex items-center justify-center w-full h-full">
        <div className="border flex items-center justify-center bg-white h-[400px] w-full max-w-[600px]">
          <Heading size={'4'} className="text-center">The page you are looking for<br />is not in your cards</Heading>
        </div>
      </div>
    </Main>
  )
}