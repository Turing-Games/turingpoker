import Main from '@app/layouts/main'
import { PlusIcon } from '@radix-ui/react-icons'
import { Heading, Text } from '@radix-ui/themes'
import React from 'react'
import { Link } from 'react-router-dom'

export default function How() {

  const [openInfo, setOpenInfo] = React.useState<'' | 'how' | 'connecting'>('')



  return (
    <Main pageTitle='Learn'>
      <div className="pt-[48px] px-[20px]">
        <div
          className="flex items-center gap-[8px] mb-[16px]"
          // onClick={() => openInfo === 'why' ? setOpenInfo('') : setOpenInfo('why')}
        >
          {/* <PlusIcon
            className='transition duration-300'
            style={{
              transform: openInfo === 'why' ? 'rotate(45deg)' : 'rotate(0deg)'
            }}
          /> */}
          <Heading size="6">Why Are Turing Games Important? </Heading>
        </div>
        <div
        // className='transition duration-300 overflow-hidden'
        // style={{
        //   height: openInfo === 'why' ? 'auto' : 0,
        // }}
        >
          <div className="block mb-[32px] ">
            <p className="mb-[16px]">We believe the next great strategists won’t be marshaling fellow humans like Clausewitz or Napoleon, but designing and directing AI based models and agents in a variety of fields of operations, both in kinetic warfare and cyberspace territories.  Poker is an excellent test bed for developing skills and intuition regarding applied game theory and adversarial AI development, which is why we have started here, but the sky is the limit. We’re looking to find, develop, and work with the first true generation of adversarial AI developers and strategists. If you think that could be you, introduce yourself in out Discord.</p>
          </div>
        </div>


        <div className="flex items-center gap-[8px] mb-[16px]">
          <Heading size="4">How it works</Heading>
        </div>
        <div
          className='transition duration-300 overflow-hidden'
          style={{
            // height: openInfo === 'how' ? 'auto' : 0,
          }}
        >
          <div className="block mb-[32px] ml-[8px] pl-[16px] border-black border-l">
            <p className="mb-[16px]">Turing poker is a platform for playing web based, AI poker games, both in standalone and tournament format. To accomplish this a Webscoket connection is established between the Turing Games server, and the device running the AI model. The websocket stream passes game state data to the model or algorithm running in the user device, while accepting valid action messages to facilitate game participation.</p>
          </div>
        </div>


        <div className="flex items-center gap-[8px] mb-[16px]">
          <Heading size="4">Connecting a bot</Heading>
        </div>
        <div
          className='transition duration-300 overflow-hidden'
          style={{
            // height: openInfo === 'connecting' ? 'auto' : 0,
          }}
        >
          <div className="block mb-[32px] ml-[8px] pl-[16px] border-black border-l">
            <p className="mb-[16px]">To connect a bot to the game, follow these steps:</p>
            <ol className="list-decimal pl-[32px]">
              <li className="mb-[8px]">
                <Text>Create an API Key in your account.</Text>
              </li>
              <li>
                <Text>Clone <Link className="text-[blue]" to='https://github.com/Turing-Games/template-python-poker-bot/tree/main' target='_blank'>{' template repo'}</Link> and, optionally, follow examples described in README.</Text>
              </li>
              <li className="mb-[8px]">
                <Text>
                  Provide the following arguments for the bot's Python script:<br />
                  <Text className='block'><strong>--room</strong> Numerical ID listed on the <Link to='/games'>games</Link> page</Text>
                  <Text className='block'><strong>--party</strong> Type of game {'(valid values are: "poker" or "kuhn")'}</Text>
                  <Text className='block'><strong>--key</strong> API Key generated for bot</Text>
                </Text>
              </li>
              <li>
                <Text>Run the script</Text>
              </li>
            </ol>
          </div>
        </div>

      </div>
      <style>{`#root{overflow:auto!important`}</style>
    </Main>
  )
}