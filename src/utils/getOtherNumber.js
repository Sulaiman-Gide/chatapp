const getOtherNumber = (users, currentUser) => {
  return users?.filter(user => user !== currentUser.phoneNumber)[0];
}

export default getOtherNumber;