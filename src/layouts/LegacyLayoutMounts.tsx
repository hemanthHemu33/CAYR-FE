import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import LeftMenu from './LeftMenu'
import TopMenu from './TopMenu'

type LegacyLayoutMountsProps = {
  withTopMenu?: boolean
  withLeftMenu?: boolean
}

const clearContainer = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.innerHTML = ''
  }
  return el
}

const LegacyLayoutMounts = ({ withTopMenu = true, withLeftMenu = true }: LegacyLayoutMountsProps) => {
  const [topContainer, setTopContainer] = useState<HTMLElement | null>(null)
  const [leftContainer, setLeftContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setTopContainer(withTopMenu ? clearContainer('includeTopMenu') : null)
    setLeftContainer(withLeftMenu ? clearContainer('includeLeftMenu') : null)
  }, [withLeftMenu, withTopMenu])

  return (
    <>
      {topContainer ? createPortal(<TopMenu />, topContainer) : null}
      {leftContainer ? createPortal(<LeftMenu />, leftContainer) : null}
    </>
  )
}

export default LegacyLayoutMounts
