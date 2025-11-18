import React from 'react';
import User from './User';

const UserList = ({ users, radius = 25, opacity = 0.8 }) => {
  return (
    <>
      {users.map((user) => (
        <User
          key={user.id}
          x={user.x}
          y={user.y}
          radius={radius}
          color={user.color}
          opacity={opacity}
        />
      ))}
    </>
  );
};

export default UserList;
