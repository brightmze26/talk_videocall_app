import MeetList from '@/components/MeetList';
import React from 'react'

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'});
  const date = (new Intl.DateTimeFormat('en-US', {dateStyle: 'full' })).format(now);

  return (
    <section className='flex size-full flex-col gap-10 text-white'>
      <div className='h-[300px] w-full rounded-[20px] bg-hero bg-cover'>
        <div className='flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-4xl font-extrabold lg:text-7xl'>
              {time}
            </h1>
            <p className='text-lg font-medium text-white lg:text-2xl'>{date}</p>
          </div>
        </div>
      </div>
      <MeetList />
    </section>
  )
}

export default Home
