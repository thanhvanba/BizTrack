import React, { useContext, useEffect, useState } from 'react'
import { Button, Drawer } from 'antd';
import {
  BellOutlined,
  SendOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
// import { LoginContext } from '../../context/LoginContext';
// import UserService from '../../service/UserService';
// import bookingSC from '../../images/done_777390.png'
// import cancelT from '../../images/signaling_4378030.png'
// import LoadNotification from '../LoadNotification';
// import { PaperAirplaneIcon } from '@heroicons/react/20/solid';
// import SelectMenu from '../SelectMenu/SelectMenu';
// import AdminService from '../../service/AdminService';
// import ManagerService from '../../service/ManagerService';
// import DetailNotification from '../DetailNotification';
// import { CheckCheck, ListChecks } from 'lucide-react';
// import Load from '../Load';
// import TimeAgo from '../TimeAgo';

function ListNotification() {
  // const { getNotificationsApi, getOneNotificationApi, readCountApi, readAllNotificationApi } = UserService()
  // const { sendNotificationADApi, getAllUserByRoleApi } = AdminService()
  // const { sendNotificationApi, getAllUserByRoleMApi } = ManagerService()

  // const { user } = useContext(LoginContext)

  const [open, setOpen] = useState(false);
  const [childrenDrawer, setChildrenDrawer] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingNoti, setLoadingNoti] = useState(true);
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [readAll, setReadAll] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectSpecific, setSelectSpecific] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [showDetailNotification, setShowDetailNotification] = useState(false)

  const [notifications, setNotifications] = useState([])
  console.log("🚀 ~ ListNotification ~ notifications:", notifications)
  const [notification, setNotification] = useState([])
  const [dataNotification, setDataNotification] = useState({})
  const [usersByRole, setUsersByRole] = useState([])
  const [selectUsersByRole, setSelectUsersByRole] = useState([])

  const handleSelectChange = (selectedValue) => {
    setDataNotification({ ...dataNotification, role: selectedValue === 'Quản lý' ? 'MANAGER' : selectedValue === 'Nhân Viên' ? 'STAFF' : 'VIEWER' })
    handleGetUsersByRole(selectedValue === 'Quản lý' ? 'MANAGER' : selectedValue === 'Nhân Viên' ? 'STAFF' : 'VIEWER')
  };
  const handleSelectSend = (selectedValue) => {
    { selectedValue === 'Cụ thể' ? setSelectSpecific(true) : setSelectSpecific(false) }
    setDataNotification({ ...dataNotification, sendTo: selectedValue === 'Tất cả' ? 'ALL' : 'SPECIFIC' })
  };
  const handleSelectType = (selectedValue) => {
    setDataNotification({ ...dataNotification, type: selectedValue })
  };
  // Get API
  const handleGetNotification = async (page) => {
    setLoadingNoti(true)
    let resNotification = await getNotificationsApi(page, 8)
    if (resNotification?.data?.result?.content?.length < 8 || resNotification?.data?.result?.pageNumber === resNotification?.data?.result?.pageSize) setHasMore(false);
    if (resNotification && resNotification?.data?.result?.content?.length > 0) {
      setNotifications(prevNotifications => [...prevNotifications, ...resNotification.data.result.content])
    } else {
      setHasMore(false);
    }
    setLoadingNoti(false)
  }
  // Xử lý cho Drawer
  const showLoading = () => {
    handleGetNotification(1)
    setOpen(true);
    setLoading(true);

    // Simple loading mock. You should add cleanup logic in real world.
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  const showChildrenDrawer = () => {
    setChildrenDrawer(true);
  };
  const onChildrenDrawerClose = () => {
    setChildrenDrawer(false);
  };


  const handleGetOneNotification = async (notificationId) => {
    setLoadingDetail(true)
    let resNotification = await getOneNotificationApi(notificationId)
    if (resNotification && resNotification.data && resNotification.data.result) {
      setNotification(resNotification.data.result)
    }
    setLoadingDetail(false)
  }
  const handleGetUsersByRole = async (role) => {
    let resUsersByRole = user.role === 'ADMIN' ? await getAllUserByRoleApi(1, 100, role) : await getAllUserByRoleMApi(1, 100, role)
    if (resUsersByRole && resUsersByRole.data && resUsersByRole.data.result) {
      setUsersByRole(resUsersByRole.data.result.content)
    }
  }
  const handleSendNotification = async () => {
    setLoadingSend(true)
    let data = dataNotification
    let resNotification = user.role === 'ADMIN' ? await sendNotificationADApi(data) : await sendNotificationApi(data)
    if (resNotification && resNotification.data && resNotification.data.result) {
      setNotifications(resNotification.data.result.content)
    }
    setLoadingSend(false)
  }

  const handleReadAllNotification = async () => {
    setReadAll(true)
    await readAllNotificationApi()
    handleGetNotification(1)
    setReadAll(false)
    handleGetReadCount()
  }
  // Xử lý thêm xóa ds userByRole
  const handleSelectUser = (value) => {
    const res = selectUsersByRole.map(user => user.userId)
    if (value && !selectUsersByRole.includes(value)) {
      setSelectUsersByRole([...selectUsersByRole, value])
      setDataNotification({ ...dataNotification, userIds: [...res, value.userId] })
      setToggle(!toggle)
    }
  }
  const handleRemoveUser = (user) => {
    const searchUser = selectUsersByRole.find((item) => item.userName === user.userName);

    if (searchUser) {
      const updatedUsers = selectUsersByRole.filter(item => item.userName !== user.userName);
      setSelectUsersByRole(updatedUsers);
      setDataNotification({ ...dataNotification, userIds: updatedUsers.map(item => item.userId) })
    }
  };

  const [readCount, setReadCount] = useState()
  const handleGetReadCount = async () => {
    // let resCount = await readCountApi()
    // if (resCount && resCount.data) {
    //   setReadCount(resCount.data.result)
    // }
  }

  useEffect(() => {
    handleGetReadCount()
  }, [])

  useEffect(() => {
    handleGetReadCount(); // Gọi API ngay khi component được mount
    const intervalId = setInterval(() => {
      handleGetReadCount();
    }, 10000); // 10000ms = 10s

    return () => clearInterval(intervalId); // Xóa interval khi component bị unmount để tránh rò rỉ bộ nhớ
  }, []);

  // Sử lý phân trang
  useEffect(() => {
    { page > 1 && handleGetNotification(page) }
  }, [page])

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
  };
  //


  return (
    <div className=''>
      <div type="" className='hover:bg-transparent active:text-none active:bg-none' onClick={showLoading}>
        <div className={`hover:opacity-70 opacity-100 flex flex-col relative px-4 cursor-pointer`}>
          <BellOutlined className='text-2xl justify-center' />
          <h2 className='text-xs'>Thông báo</h2>
          {readCount !== 0 && <span className='absolute text-center -top-3 right-6 rounded-full bg-red-600 text-white h-5 w-5 text-[12px] leading-5'>{readCount ||10}</span>}
        </div>
      </div>
      {/* <Drawer
        closable={false}
        destroyOnClose
        title={<p className='text-2xl font-bold flex items-center gap-x-1 -mx-3'> <BellOutlined className='h-7' />Thông báo</p>}
        placement="right"
        open={open}
        loading={loading}
        onClose={() => { setOpen(false); setNotifications([]); setHasMore(true); setPage(1) }}
        width={450}
        className='relative'
      >
        {(user.role !== 'VIEWER' && user.role !== 'STAFF') &&
          <div className='absolute top-5 right-3' onClick={showChildrenDrawer}>
           <SendOutlined className='text-2xl text-blue-600 hover:text-blue-800' /> 
          </div>
        }
        <Drawer
          title={
            <div className='text-2xl font-bold flex items-center justify-between -mx-3'>
              Gửi thông báo
              <div onClick={() => handleSendNotification()}>
                {loadingSend ? <LoadingOutlined /> : <SendOutlined className='h-6 w-6 text-blue-600 hover:text-blue-800' />}
              </div>
            </div>
          }
          width={400}
          closable={false}
          onClose={onChildrenDrawerClose}
          open={childrenDrawer}
          style={{ backgroundColor: '#f1f5f9' }}
        >
          <div className='-mx-3 mb-2 bg-slate-50 p-3 rounded-lg'>
            <div className='flex justify-between gap-x-2'>
              <div className="relative mb-4 w-1/2">
                <label
                  htmlFor=""
                  className="block text-lg leading-6 text-gray-900"
                >
                  Gửi đến
                </label>
                <div className="relative mt-1 w-full cursor-default rounded-md bg-white py-1 pl-1 text-left text-gray-900 shadow-sm focus:outline-none border-2 sm:text-sm sm:leading-6">
                  {
                    <SelectMenu onSelectChange={handleSelectChange} items={user.role === 'ADMIN' ? ['Quản lý', 'Nhân Viên', 'Người dùng'] : ['Nhân Viên', 'Người dùng']} content={"Chọn chức vụ"} />
                  }
                </div>
              </div>
              <div className="relative mb-4 w-1/2">
                <label
                  htmlFor=""
                  className="block text-lg leading-6 text-gray-900"
                >
                  Đối tượng
                </label>
                <div className="relative mt-1 w-full cursor-default rounded-md bg-white py-1 pl-1 text-left text-gray-900 shadow-sm focus:outline-none border-2 sm:text-sm sm:leading-6">
                  {
                    <SelectMenu onSelectChange={handleSelectSend} items={['Tất cả', 'Cụ thể']} content={"Chọn đối tượng"} />
                  }
                </div>
              </div>
            </div>
            {selectSpecific &&
              <div className="w-full relative">
                <label
                  htmlFor=""
                  className="block text-lg leading-6 text-gray-900"
                >
                  Danh sách các đối tượng
                </label>
                <div onClick={() => setToggle(!toggle)} className='absolute top-0 right-1 bg-slate-100 rounded-sm hover:bg-slate-200 cursor-pointer'>
                  <ChevronUpDownIcon className='h-5 text-gray-400' />
                </div>
                <div
                  className={`${selectUsersByRole.length <= 4 ? "h-10" : "h-12"} modal-body flex items-center overflow-x-auto w-full px-2 mt-1 py-0.5 text-sm text-black focus:outline-none rounded-md border-2`}
                >
                  {selectUsersByRole.length === 0 ?
                    <span className='flex items-center text-lg text-gray-400'>Chọn đối tượng cụ thể</span>
                    : selectUsersByRole.map((user) => (
                      <div className='relative h-5 bg-green-200 rounded-md mx-0.5'>
                        <div className='text-sm text-center px-1 h-5 w-20 cursor-default' >
                          {user.userName}
                        </div>
                        <button className='absolute top-0 -right-3 text-red-400 pr-2'
                          onClick={() => {
                            handleRemoveUser(user)
                          }}
                        >
                          <sup className='text-xs'><XMarkIcon className='h-4' /></sup>
                        </button>
                      </div>
                    ))}
                </div>
                {toggle &&
                  <div className='absolute top-7 right-0 bg-white shadow-xl border-2 rounded-xl w-48 z-[100]'>
                    <ul className='modal-body overflow-y-auto max-h-60'>
                      {usersByRole && usersByRole.map((userByRole) => (
                        <li
                          onClick={() => handleSelectUser(userByRole)}
                          className='py-2 px-3 flex hover:bg-[#4F46E5] hover:text-white'
                        >
                          <span className='ml-3 cursor-default'>{userByRole.userName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              </div>
            }
            <div className="relative mt-4">
              <label
                htmlFor=""
                className="block text-lg leading-6 text-gray-900"
              >
                Loại thông báo
              </label>
              <div className="relative mt-1 pr-4 w-full cursor-default rounded-md bg-white py-1 pl-3 text-left text-gray-900 shadow-sm focus:outline-none border-2 sm:text-sm sm:leading-6">
                {
                  <SelectMenu onSelectChange={handleSelectType} items={['BOOKING_SUCCESS', 'TICKET_REMINDER', 'TICKET_STATUS', 'PROMOTION', 'REVIEW', 'LOW_STOCK', 'OTHER']} content={"Chọn loại thông báo"} />
                }
              </div>
            </div>
          </div>
          <div className='-mx-3 mt-2 bg-slate-50 p-3 rounded-lg'>
            <div className="relative mb-4">
              <label
                htmlFor=""
                className="block text-lg leading-6 text-gray-900"
              >
                Tiêu đề
              </label>
              <input
                onChange={e => {
                  setDataNotification({ ...dataNotification, title: e.target.value })
                  // clearError('title')
                }}
                placeholder='Nhập tiêu đề'
                type="text"
                className="block w-full px-4 py-1 text-lg text-black focus:outline-none rounded-md border-2 focus:border-blue-600"
              // defaultValue={oneMovie.title}
              />
            </div>
            <div className="my-4">
              <label
                htmlFor=""
                className="block text-lg leading-6 text-gray-900"
              >
                Chi tiết thông báo
              </label>
              <textarea
                onChange={e => {
                  setDataNotification({ ...dataNotification, message: e.target.value })
                  // clearError('desc')
                }}
                type="text"
                placeholder='Nhập mô tả'
                className="block w-full px-4 py-1 text-lg text-black focus:outline-none rounded-md border-2 focus:border-blue-600"
                // defaultValue={oneMovie.desc}
                rows={5}
              />
            </div>
          </div>
        </Drawer>
        {!loadingNoti ?
          notifications?.length !== 0 ?
            <div className='relative rounded-lg bg-white -mx-4 mt-5 '>
              <div
                onClick={handleReadAllNotification}
                className='flex items-center z-10 gap-x-2 text-[#80a3ef] absolute -top-10 right-3 border-2 px-2 py-1 rounded-lg border-[#80a3ef] cursor-pointer hover:bg-slate-50 hover:text-[#6388d9]'
              >
                {readAll ? <Load /> : <CheckCheck className='h-6' />}
                Đánh dấu tất cả
              </div>
              {notifications.map(notif => (
                <ul className={`${notif.read === false ? 'bg-zinc-100' : ''} text-gray-900 hover:bg-gray-200 rounded-md py-2 pl-2 pr-8 cursor-default relative`}>
                  <li
                    onClick={() => {
                      if (notif?.read === false) { setReadCount(pre => pre - 1); handleGetReadCount(); }
                      handleGetOneNotification(notif?.notificationUserId)
                      setNotifications([])
                      setShowDetailNotification(true)
                      setOpen(false)
                      setHasMore(true)
                      setPage(1)
                    }}
                    className='flex items-center gap-x-3'
                  >
                    <img className='h-16 w-16' src={bookingSC} alt="" />
                    <div className='relative pb-6'>
                      <h3 className='text-base font-bold items-center'>{notif.notification.title}</h3>
                      <p className='items-center'>{notif.notification.message}</p>
                      <p className={`${!notif.read ? 'text-blue-500' : 'text-zinc-400'} absolute bottom-0 left-0`}>{notif.createdAt === null ? '-' : TimeAgo(notif.createdAt)}</p>
                    </div>
                    {notif.read === false && <div className='absolute right-1 h-3 w-3 bg-red-600 rounded-full'></div>}
                  </li>
                </ul>
              ))}
              {hasMore && <button className='w-full' onClick={loadMore}><span className='text-center'>Xem thêm</span></button>}
            </div> : <span className='font-light text-sm flex items-center justify-center'>Chưa có thông báo</span>
          :
          <div className='absolute top-10 left-0 right-0 bottom-0'>
            <LoadNotification />
          </div>
        }
      </Drawer>
      {showDetailNotification &&
        <div className='flex justify-center items-center bg-black bg-opacity-30 w-full h-screen right-0 bottom-0 fixed z-50'>
          <DetailNotification notification={notification} setShowDetailNotification={setShowDetailNotification} setNotification={setNotification} loadingDetail={loadingDetail} />
        </div>
      } */}
    </div >
  );

}

export default ListNotification
