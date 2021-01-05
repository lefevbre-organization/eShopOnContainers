/* eslint-disable no-undef */
import React, { useState } from 'react';
import { Jutsu } from 'react-jutsu';

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