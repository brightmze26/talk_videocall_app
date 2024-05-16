"use client"

import { useState } from 'react';
import HomeCard from './HomeCard';
import { useRouter } from 'next/navigation';
import MeetModal from './MeetModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input';


const MeetList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined> ();
    const { user } = useUser();
    const client = useStreamVideoClient();
    const [values, setValues] = useState({
      dateTime: new Date(),
      description: '',
      link: ''
    })
    const [callDetails, setCallDetails] = useState<Call>()
    const { toast } = useToast()

    const createMeeting = async () => {
      if(!client || !user) return

      try {
        if(!values.dateTime) {
          toast({ title: "Please select a date and time" })
          return;
        }

        const id = crypto.randomUUID();
        const call = client.call('default', id);

        if(!call) throw new Error('Failed to create call')

        const startsAt = values.dateTime.toISOString() || 
        new Date(Date.now()).toISOString();
        const description = values.description || 'Instant meeting';

        await call.getOrCreate({
          data: {
            starts_at: startsAt, 
            custom: {
              description
            }
          }
        })

        setCallDetails(call);

        if(!values.description) {
          router.push(`/meeting/${call.id}`)
        }

        toast({ title: "Meeting Created" })
      } catch (error) {
        console.log(error);
        toast({ title: "Failed to create meeting", })
      }
    }

    const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetails?.id}`

  return (
    <section className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4 '>
        <HomeCard 
          img='/icons/add-meeting.svg'
          title='New Meeting'
          description='Start meet to everyone'
          handleCLick={() => setMeetingState ('isInstantMeeting')}
          className='bg-blue-1'
        />
        <HomeCard 
          img='/icons/schedule.svg'
          title='Schedule'
          description='Set a schedule to meeting'
          handleCLick={() => setMeetingState ('isScheduleMeeting')}
          className='bg-blue-1'
        />
        <HomeCard
          img='/icons/recordings.svg'
          title={'Recordings'}
          description='Trace of your recording'
          handleCLick={() => router.push('/recordings')}
          className='bg-blue-1'
        />
        <HomeCard
          img='/icons/join-meeting.svg'
          title='Join Meeting'
          description='via invitation link'
          handleCLick={() => setMeetingState('isJoiningMeeting')}
          className='bg-blue-1'
        />

        {!callDetails ? (
          <MeetModal 
            isOpen={meetingState === 'isScheduleMeeting'}
            onClose={() => setMeetingState(undefined)}
            title='Create Meeting'
            handleClick={createMeeting}
          >
            <div className='flex flex-col gap-2.5'>
              <label className='text-base text-normal leading-[22px]'> 
                Title or description
              </label>
              <Textarea className='border-none bg-dark-2 focus-visible:ring-0 focus-visible:ring-offset-0'
                onChange={(e) => {
                  setValues({...values, description: e.target.value})
                }}/>
            </div>
            <div className='flex w-full flex-col gap-2.5'>
              <label className='text-base text-normal leading-[22px]'> 
                Select Date and Time
              </label>
              <ReactDatePicker 
                selected={values.dateTime}
                onChange={(date) => setValues({...values, dateTime: date! })}
                showTimeSelect
                timeFormat='HH:mm'
                timeIntervals={15}
                timeCaption='time'
                dateFormat='MMMM d, yyyy h:mm aa'
                className='w-full rounded bg-dark-2 p-2 focus:outline-none'
              />
            </div>
          </MeetModal>
        ) : (
        <MeetModal 
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title='Meeting Created'
          className='text-center'
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link copied' })
          }}
          image = '/icons/checked.svg'
          buttonIcon = '/icons/copy.svg'
          buttonText = 'Copy Meeting Link'
        />
        )}
        <MeetModal 
          isOpen={meetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title='Start an Instant Meeting'
          className='text-center'
          buttonText='Start Meeting'
          handleClick={createMeeting}
        />

        <MeetModal 
          isOpen={meetingState === 'isJoiningMeeting'}
          onClose={() => setMeetingState(undefined)}
          className='text-center'
          buttonText='Join Meeting'
          handleClick={() => router.push(values.link)}
        >
          <Input
          placeholder='Meeting link'
          className='bg-dark-2 focus-visible:ring-offset-0'
          onChange={(e) => setValues({ ...values, link: e.target.value })} 
        />
        </MeetModal>

        
    </section>
  )
}

export default MeetList
