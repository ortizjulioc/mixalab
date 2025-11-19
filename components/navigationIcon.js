// components/navigationIcon.js (actualizado con size={32} para consistencia)
import React from 'react'
import { FaArchive } from 'react-icons/fa';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineCog,
} from 'react-icons/hi'
import { MdLibraryMusic } from "react-icons/md";  // food icon

const navigationIcon = {
  home: <HiOutlineHome size={32} />,
  product: <HiOutlineCube size={32} />,
  customer: <HiOutlineUserGroup size={32} />,
  maintenance: <HiOutlineCog size={32} />,
  genre: <MdLibraryMusic size={32} />,
  service:<FaArchive size={32}/>,
  users:<HiOutlineUserGroup size={32}/>,
  tiers:<HiOutlineUserGroup size={32}/>,
  'maintain-requierements':<HiOutlineUserGroup size={32}/>,
  'upgrade-requirements':<HiOutlineUserGroup size={32}/>,
  'downgrade-triggers':<HiOutlineUserGroup size={32}/>,



}

export default navigationIcon