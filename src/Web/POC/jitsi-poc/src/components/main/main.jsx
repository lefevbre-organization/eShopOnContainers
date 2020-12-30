import React, { useState } from 'react';
import { Jutsu } from 'react-jutsu'


const Main = () => {
    const [room, setRoom] = useState('')
    const [name, setName] = useState('')
    const [call, setCall] = useState(false)
    const [password, setPassword] = useState('')

    const handleClick = event => {
        event.preventDefault()
        if (room && name) setCall(true)
    }

    return call ? (
        <Jutsu
            domain="meet-test.lefebvre.es"
            containerStyles={{ width: '100%', height: '100vh' }}
            height='100%'
            roomName={room}
            displayName={name}
            password={password}
            loadingComponent={<p>loading ...</p>}
            errorComponent={<p>Oops, something went wrong...</p>} />
    ) : (
            <form>
                <input id='room' type='text' placeholder='Room' value={room} onChange={(e) => setRoom(e.target.value)} />
                <input id='name' type='text' placeholder='Name' value={name} onChange={(e) => setName(e.target.value)} />
                <input id='password' type='text' placeholder='Password (optional)' value={password} onChange={(e) => setPassword(e.target.value)} />
                <button onClick={handleClick} type='submit'>
                    Start / Join
                </button>
            </form>
    )
}

export default Main;