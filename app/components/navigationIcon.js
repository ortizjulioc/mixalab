// components/navigationIcon.js (actualizado con size={32} para consistencia)
import React from 'react'
import { FaRegKeyboard } from 'react-icons/fa'
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineDocumentDuplicate,
  HiOutlineCurrencyDollar,
  HiOutlineClipboardList,
  HiOutlineDocumentReport,
  HiOutlineDocumentText,
} from 'react-icons/hi'
import { TbListNumbers } from 'react-icons/tb'
import { GoGitMerge } from "react-icons/go"
import { LiaUserNurseSolid } from "react-icons/lia"; // nurse icon
import { LuChefHat } from "react-icons/lu"; // chef hat icon
import { MdOutlineFoodBank } from "react-icons/md";  // food icon

const navigationIcon = {
  home: <HiOutlineHome size={32} />,
  product: <HiOutlineCube size={32} />,
  customer: <HiOutlineUserGroup size={32} />,
  maintenance: <HiOutlineCog size={32} />,
  // billing: <HiOutlineDocumentText size={32} />,

}

export default navigationIcon