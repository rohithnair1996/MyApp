import React from 'react';
import User from './User';

const UserList = ({ users, radius = 25 }) => {
  return (
    <>
      {users.map((user) => (
        <User
          key={user.id}
          x={user.x}
          y={user.y}
          radius={radius}
          color={user.color}
        />
      ))}
    </>
  );
};

export default UserList;
