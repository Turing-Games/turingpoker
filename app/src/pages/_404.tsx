import GameClient from '@app/components/GameClient';
import Main from '@app/layouts/main';
import { Heading } from '@radix-ui/themes';
import { useParams } from 'react-router-dom';
import Logo from '@static/images/404.png'


export default function _404() {

  return (
    <Main pageTitle='Page Not Found'>
      <div className="flex items-center justify-center w-full h-full">
        <div className="border flex flex-col items-center justify-center bg-white h-[400px] w-full max-w-[600px]">
          <div className="flex items-center text-turing-red" >
            <Heading className="m-0" style={{ fontSize: '10rem' }}>4</Heading>
            <img src={Logo} className="w-[90px] mt-[20px] mx-[16px]" />
            <Heading className="m-0" style={{ fontSize: '10rem' }}>4</Heading>
          </div>
          <Heading size={'4'} className="text-center mt-[24px] mb-0">The page you are looking for<br />is not in your cards</Heading>
        </div>
      </div>
    </Main>
  )
}