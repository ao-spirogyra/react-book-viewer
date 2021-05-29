import React, { useState, useRef, useEffect, useMemo } from 'react'
import '../css/BookViewer.css'
export interface BookViewer {
  pages: string[],
  children?: {
    Render: React.FC
    height: string
  },
  direction?: 'ltr' | 'rtl'
}

export const BookViewer: React.FC<BookViewer> = ({pages, children, direction}: BookViewer) => {
  if (children && (!children?.height || (!children.height.endsWith('px') && !children.height.endsWith('%')))) {
    console.error('invalid height. use \'px\' or \'%\'')
    return null
  }
  const [currentPage, setCurrentPage] = useState(0)
  const [imgWidth, setImgWidth] = useState<number>(0)
  const [imgHeight, setImgHeight] = useState<number>(0)
  const [maxImgHeight, setMaxImgHeight] = useState(0)
  const [isLastPage, setIsLastPage] = useState(false)
  const [isFirstPage, setIsFirstPage] = useState(true)
  const imgElement = useRef<HTMLImageElement>(null)
  const [imgStyle, setImgStyle] = useState<{}>()
  const [imgContainerStyle, setImgContainerStyle] = useState<{}>()
  const [imgBoxStyle, setImgBoxStyle] = useState<{}>()
  useEffect(() => {
    const originalMargin = document.body.style.margin
    const originalOverflow = document.body.style.overflow
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.margin = originalMargin
      document.body.style.overflow = originalOverflow
    }
  }, [])
  useEffect(() => {
    if (imgElement.current?.width && imgElement.current?.width) {
      setImgWidth(imgElement.current.width)
      setImgHeight(imgElement.current.height)
    }
    setMaxImgHeight(calculateImgHeight)
  })
  useEffect(() => {
    if (imgHeight && imgWidth) {
      if (imgHeight > imgWidth || imgWidth < window.innerWidth) {
        setImgStyle({
          height: '100%',
          width: 'auto'
        })
        setImgContainerStyle({
          height: maxImgHeight,
          width: 'auto'
        })
        setImgBoxStyle({})
      } else {
        setImgStyle({
          height: 'auto',
          width: '100%'
        })
        setImgContainerStyle({
          height: maxImgHeight,
          width: '100%'
        })
        setImgBoxStyle({
          width: '60%'
        })
      }
    }
  }, [imgElement.current?.src])

  const checkPage = (page) => {
    if (page === pages.length-1) {
      setIsFirstPage(false)
      setIsLastPage(true)
    } else if (page === 0) {
      setIsFirstPage(true)
      setIsLastPage(false)
    } else {
      setIsFirstPage(false)
      setIsLastPage(false)
    }
  }
  const calculateImgHeight = useMemo(() => {
    if (children?.height.endsWith('px')) {
      const heightPx = children.height.split('px')[0]
      return window.innerHeight*0.95-Number(heightPx)
    } else if (children?.height.endsWith('%')) {
      const heightPercent = children.height.split('%')[0]
      return window.innerHeight*(1-(0.05+Number(heightPercent)/100))
    } else {
      return window.innerHeight*0.95
    }
  }, [children?.height])
  
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value)
    setCurrentPage(newValue)
    checkPage(newValue)
  }
  const nextPage = () => {
    const newValue = currentPage + 1
    setCurrentPage(newValue)
    checkPage(newValue)
  }
  const backPage = () => {
    const newValue = currentPage - 1
    setCurrentPage(newValue)
    checkPage(newValue)
  }
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.code === "KeyA" && !isLastPage){
      nextPage()
    } else if (e.code === "ArrowLeft" && !isLastPage){
      nextPage()
    } else if (e.code === "KeyD" && !isFirstPage){
      backPage()
    } else if (e.code === "ArrowRight" && !isFirstPage){
      backPage()
    }
  }
  // Don't attach onKeyDown to div element
  // Otherwise it will stop working
  document.onkeydown=(e)=>{onKeyDown(e)}

  const renderButtons = () => {
    if (direction === 'ltr') {
      return (
        <div className="page-buttons">
          <button className="go-left-button" onClick={backPage} disabled={isFirstPage} tabIndex={-1} style={{width: imgWidth/2}}>
            <button className='go-left-arrow-button' onClick={backPage} disabled={isFirstPage} tabIndex={-1} style={isFirstPage ? { opacity: '25%' } : {}}>
              <span className='go-left-arrow'></span>
            </button>
          </button>
          <button className="go-right-button" onClick={nextPage} disabled={isLastPage} tabIndex={-1} style={{width: imgWidth/2}}>
          <button className='go-right-arrow-button' onClick={nextPage} disabled={isLastPage} tabIndex={-1} style={isLastPage ? { opacity: '25%' } : {}}>
              <span className='go-right-arrow'></span>
            </button>
          </button>
        </div>
      )
    } else {
      return (
        <div className="page-buttons">
          <button className="go-left-button" onClick={nextPage} disabled={isLastPage} tabIndex={-1} style={{width: imgWidth/2}}>
            <button className='go-left-arrow-button' onClick={nextPage} disabled={isLastPage} tabIndex={-1} style={isLastPage ? { opacity: '25%' } : {}}>
              <span className='go-left-arrow'></span>
            </button>
          </button>
          <button className="go-right-button" onClick={backPage} disabled={isFirstPage} tabIndex={-1} style={{width: imgWidth/2}}>
          <button className='go-right-arrow-button' onClick={backPage} disabled={isFirstPage} tabIndex={-1} style={isFirstPage ? { opacity: '25%' } : {}}>
              <span className='go-right-arrow'></span>
            </button>
          </button>
        </div>
      )
    }
  }

  return (
    <div className='container-book-viewer' style={{height: window.innerHeight}}>
      {children && <children.Render/>}
      <div className='image-container' style={imgContainerStyle}>
        <div className="image-box" style={imgBoxStyle}>
          <img className='image' src={pages[currentPage]} alt="" ref={imgElement} style={imgStyle}/>
          {renderButtons()}
        </div>
      </div>
      <div className='tooltip-bar'>
        <input className='input' type="range" min={0} max={pages.length-1} onChange={onChange} value={currentPage} style={direction ? {direction: direction} : {direction: 'rtl'}}/>
      </div>
    </div>
  )
}