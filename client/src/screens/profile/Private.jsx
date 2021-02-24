import React, { useState, useEffect } from 'react';
import authSvg from '../../assets/update.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';
import { updateUser, isAuth, getCookie, signout } from '../../helpers/auth';
import "./profile.style.css";
import Map from "./map/Map"

const Private = ({ history }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password1: '',
    textChange: 'Update',
    role: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const token = getCookie('token');
    axios
      .get(`${process.env.REACT_APP_API_URL}/user/${isAuth()._id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      .then(res => {
        const { role, name, email } = res.data;
        setFormData({ ...formData, role, name, email });
      })
      .catch(err => {
        toast.error(`Error To Your Information ${err.response.statusText}`);
        if (err.response.status === 401) {
          signout(() => {
            history.push('/login');
          });
        }
      });
  };
  const { name, email, password1, textChange, role } = formData;
  const handleChange = text => e => {
    setFormData({ ...formData, [text]: e.target.value });
  };
  const handleSubmit = e => {
    const token = getCookie('token');
    console.log(token);
    e.preventDefault();
    setFormData({ ...formData, textChange: 'Submitting' });
    axios
      .put(
        `${process.env.REACT_APP_API_URL}/user/update`,
        {
          name,
          email,
          password: password1
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      .then(res => {
        updateUser(res, () => {
          toast.success('Profile Updated Successfully');
          setFormData({ ...formData, textChange: 'Update' });
        });
      })
      .catch(err => {
        console.log(err.response);
      });
  };

  return (
    <div className='profileParentDiv flex'>
      <ToastContainer />
      <div className='profileViewDiv shadow  flex flex-1'>
        <div className='profileInfoDiv'>
          <div className='profileInfo flex'>
            <h1 className='profileTitle'>
              Profile Update
            </h1>

            <form
              className='profileForm flex-1'
              onSubmit={handleSubmit}
            >
              <div className='profileInputDiv'>
                <input
                  disabled
                  className='profileInputs'
                  type='text'
                  placeholder='Role'
                  value={role}
                />
                <input
                  className='profileInputs '
                  type='email'
                  placeholder='Email'
                  disabled
                  value={email}
                />
                <input
                  className='profileInputs '
                  type='text'
                  placeholder='Name'
                  onChange={handleChange('name')}
                  value={name}
                />

                <input
                  className='profileInputs'
                  type='password'
                  placeholder='Password'
                  onChange={handleChange('password1')}
                  value={password1}
                />
                <button
                  type='submit'
                  className='profileSubmitBtn flex focus:shadow-outline'
                >
                  <i className='Icon fas fa-user-plus fa 1x ' />
                  <span className='ml-3'>{textChange}</span>
                </button>
              </div>
              <div className='pageBreak'>
                <div className='pageBreakText'>
                  Go To Home
                </div>
              </div>
              <div className='homeBtn flex'>
                <a
                  className='homeBtnInterior flex focus:outline-none focus:shadow-outline '
                  href='/'
                  target='_self'
                >
                  <i className='fas fa-home fa 1x' />
                  <span className='ml-4'>Home</span>
                </a>
              </div>
            </form>
          </div>
        </div>
        <div className='map '>
          <Map />
          {/* <div
            className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'
            style={{ backgroundImage: `url(${authSvg})` }}
          ></div> */}
        </div>
      </div>
      ;
    </div>
  );
};

export default Private;