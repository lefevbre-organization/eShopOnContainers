import React, { useState } from 'react';
import Jitsi from 'react-jitsi'

import Loader from '../loader/loader';
import './main.css';

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
        <Jitsi
            domain="meet-test.lefebvre.es"
            containerStyle={{ width: '100%', height: '100vh' }}
            roomName={room}
            displayName={name}
            loadingComponent={Loader}
            password={password}
            />
    ) : (
        <div className="container-main flex-main">
            <div className="box-main flex-main">
                <form>
                    <input 
                     id='room' 
                     type='text'
                     placeholder='Sala' 
                     value={room} 
                     onChange={(e) => 
                     setRoom(e.target.value)} 
                    />
                    <br />
                    <input 
                     id='name' 
                     type='text' 
                     placeholder='Nombre' 
                     value={name} 
                     onChange={(e) => setName(e.target.value)} 
                    />
                    <br />
                    <input 
                     id='password' 
                     type='password' 
                     placeholder='Contraseña (opcional)' 
                     value={password} 
                     onChange={(e) => setPassword(e.target.value)} 
                    />
                    <br />
                    <button onClick={handleClick} type='submit'>
                        Iniciar
                    </button>
                </form>
            </div> 
        </div>
    )
}

export default Main;