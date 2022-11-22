import React, { useCallback, useState, useRef, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import styled from 'styled-components';

import '/Users/alanbalcom/Desktop/React-Portfolio/src/contact.scss'

function Footer() {
    const [list, setList] = useState([]);
    let toastProperties = null;
    // SETS PROPERTIES FOR THE TOAST NOTIFICATION
    const showToast = () => {
      toastProperties = {
        id: 1,
        title: 'THANKS!',
        description: 'I will get back to you soon.',
        backgroundColor: '#5cb85c',
      };
      setList([toastProperties]);
    };
    // CALLBACK FUNCTION FOR DELETING AN ACTIVE NOTIFICATION
    const deleteToast = useCallback(
      (id) => {
        const listItem = list.filter((e) => e.id !== id);
        setList(listItem);
      },
      [list]
    );
    // SETS STATE AS DEPENDENCIES AND USES 4 SECOND TIMER TO DELETE ACTIVE NOTIFIACTIONS AUTOMATICALLY
    useEffect(() => {
      const interval = setInterval(() => {
        if (list.length) {
          deleteToast(list[0].id);
        }
      }, 4000);
  
      return () => {
        clearInterval(interval);
      };
    }, [list, deleteToast]);
  
    const form = useRef();
    // SUBMITS FORM THROUGH THE EMAIL.JS API
    const sendEmail = (e) => {
      e.preventDefault();
  
      emailjs.sendForm('service_4l9lttf', 'template_a60mqid', form.current, 'XmtPk8I0OJdOV7HJB').then(
        (result) => {
          console.log(result.text);
          e.target.reset();
          showToast();
        },
        (error) => {
          console.log(error.text);
        }
      );
    };

    return (
    <>
    <footer id='contact-me'>
        <h3>CONTACT ME</h3>
        <div className="notification">
            {list.map((toast, i) => (
            <div key={i} className="toastNotice popin">
                <button className="notifClose" onClick={() => deleteToast(toast.id)}>
                x
                </button>
                <div>
                <p className="notificationTitle">{toast.title}</p>
                <p className="notificationDesc">{toast.description}</p>
                </div>
            </div>
            ))}
        </div>

        <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <div
            className="card  z-depth-3"
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '600px',
                borderRadius: '10px',
                color: 'black',
            }}
            >
            <StyledContactForm className="container">
                <form ref={form} onSubmit={sendEmail}>
                <label>Name</label>
                <input className="white-text" type="text" name="user_name" required />
                <label>Email</label>
                <input className="white-text" type="email" name="user_email" required />
                <label>Message</label>
                <textarea className="white-text" name="message" required />
                <input type="submit" value="Send" />
                </form>
            </StyledContactForm>
            </div>
        </div>
    </footer>
     
    </>
    );
  }

  // APPLIES STLYES TO THE CONTACT FORM AND
  const StyledContactForm = styled.div`
    width: 400px;
  
    form {
      display: flex;
      align-items: flex-start;
      flex-direction: column;
      width: 100%;
      font-size: 16px;
      padding-bottom: 2rem;
  
      input {
        width: 100%;
        height: 35px;
        padding: 7px;
        outline: none;
        border-radius: 5px;
        border: 1px solid rgb(220, 220, 220);
  
        &:focus {
          border: 2px solid rgba(0, 206, 158, 1);
        }
      }
  
      textarea {
        max-width: 100%;
        min-width: 100%;
        width: 100%;
        max-height: 100px;
        min-height: 100px;
        padding: 7px;
        outline: none;
        border-radius: 5px;
        border: 1px solid rgb(220, 220, 220);
  
        &:focus {
          border: 2px solid rgba(0, 206, 158, 1);
        }
      }
  
      label {
        margin-top: 1rem;
      }
  
      input[type='submit'] {
        background: rgb(33, 119, 30);
        margin-top: 2rem;
        cursor: pointer;
        color: white;
        border: none;
      }
    }
  `;


export default Footer;