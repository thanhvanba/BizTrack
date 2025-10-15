import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import userService from "../../service/userService";
import UserInfoTab from "./UserInfoTab";

const ExpandedUserTabs = ({ record }) => {
  const [selectedUser, setSelectedUser] = useState();

  useEffect(() => {
    const handleViewDetail = async () => {
      if (record?.user_id) {
        const res = await userService.getUserByUserID(record.user_id);
        if (res && res.data) {
          setSelectedUser(res.data);
        }
      }
    };
    handleViewDetail();
  }, [record]);

  const tabItems = [
    {
      key: "info",
      label: "Thông tin",
      children: <UserInfoTab user={selectedUser} />,
    },
  ];
  return (
    <div className="bg-white p-6 py-4 rounded-md shadow-sm">
      <Tabs items={tabItems} className="mb-6" />
    </div>
  );
};

export default ExpandedUserTabs;
