/* eslint-disable */

import { useState, useEffect, useRef } from 'react';
import { DyteMeeting, provideDyteDesignSystem } from '@dytesdk/react-ui-kit';
import { useDyteClient } from '@dytesdk/react-web-core';

import Heading from './Heading';
import { joinMeeting } from './utils'

// Constants
const SERVER_URL = process.env.SERVER_URL || "http://localhost:8000"
let LAST_BACKEND_PING_TIME = 0;
const DETECT_FACES_ENDPOINT = `${SERVER_URL}/same_faces`;
const TIME_BETWEEN_BACKEND_PINGS = 15000;

const Meet = () => {
    const meetingEl = useRef();
    const [meeting, initMeeting] = useDyteClient();
    const [userToken, setUserToken] = useState();
    const [isAdminBool, setAdminBool] = useState(null);
    const meetingId = window.location.pathname.split('/')[2]

    const isAdmin = async (id) => {
        const res = await fetch(`${SERVER_URL}/is_admin`, {
            method: "POST",
            body: JSON.stringify({ admin_id: window.localStorage.getItem("adminId") || '', meeting_id: meetingId || '' }),
            headers: { "Content-Type": "application/json" }
        })
        const resJson = await res.json()
        setAdminBool(resJson.admin)
    }

    const joinMeetingId = async () => {
        if (meetingId) {
            const authToken = await joinMeeting(meetingId)
            await initMeeting({
                authToken,
            });
            setUserToken(authToken)
        }
    }

    useEffect(() => {
        if (meetingId && !userToken) joinMeetingId()
        isAdmin()
    }, [])

    useEffect(() => {
        if (userToken) {
            provideDyteDesignSystem(meetingEl.current, {
                theme: 'dark'
            });
        }
    }, [userToken])

    return (
        <div style={{ height: "96vh", width: "100vw", display: "flex" }}>
            {userToken &&
                <>
                    {isAdminBool ? <div style={{ width: "60vw", height: "96vh" }}><DyteMeeting mode='fill' meeting={meeting} ref={meetingEl} /></div> : <div style={{ width: "100vw", height: "96vh" }}><Heading text={"Proctoring Candidate Interface"} /><DyteMeeting mode='fill' meeting={meeting} ref={meetingEl} /></div>}
                </>
            }
        </div>
    )
}

export default Meet