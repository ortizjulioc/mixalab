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
  billing: <FaRegKeyboard size={32} />,
  billings: <HiOutlineDocumentDuplicate size={32} />,
  prebills: <HiOutlineDocumentText size={32} />,
  // report: <HiOutlineDocumentReport size={32} />,
  order: <HiOutlineClipboardList size={32} />,
  cxc: <HiOutlineCurrencyDollar size={32} />,
  ncf: <TbListNumbers size={32} />,
  report: <HiOutlineDocumentReport size={32} />,
  log: <GoGitMerge size={32} />,
  nurse: <LiaUserNurseSolid size={32} />,
  chef: <LuChefHat size={32} />,
  tipodieta: <MdOutlineFoodBank size={32} />,
}

export default navigationIcon