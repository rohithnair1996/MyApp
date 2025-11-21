import React from 'react';
import User from './User';

const UserList = ({ users }) => {
  return (
    <>
      {users.map((user) => (
        <User
          key={user.id}
          x={user.x}
          y={user.y}
          color={user.color}
          image={user.image}
        />
      ))}
    </>
  );
};

export default React.memo(UserList);
