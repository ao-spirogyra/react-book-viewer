import React, { useState, useRef, useEffect } from 'react'
import '../css/BookViewer.css'
export interface BookViewer {
  pages: string[],
  children?: {
    Render: React.FC
    height: string
  }
}

export const BookViewer: React.FC<BookViewer> = ({pages, children}: BookViewer) => {
  if (!children?.height || (!children.height.endsWith('px') && !children.height.endsWith('%'))) {
    console.error('invalid height. use \'px\' or \'%\'')
    return null
  }
  const [currentPage, setCurrentPage] = useState(0)
  const [imgWidth, setImgWidth] = useState<number>(0)
  const [isLastPage, setIsLastPage] = useState(false)
  const [isFirstPage, setIsFirstPage] = useState(true)
  const imgElement = useRef<HTMLImageElement>(null)
  useEffect(() => {
    if (imgElement.current) {
      setImgWidth(imgElement?.current?.width)
    }
  }, [currentPage])
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
  let imgHeight;
  if (children?.height.endsWith('px')) {
    const heightPx = children.height.split('px')[0]
    imgHeight = window.innerHeight*0.95-Number(heightPx)
  } else if (children?.height.endsWith('%')) {
    const heightPercent = children.height.split('%')[0]
    imgHeight = window.innerHeight*(1-(0.05+Number(heightPercent)/100))
  }
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

  return (
    <div className='container-book-viewer' style={{height: window.innerHeight}}>
      {children && <children.Render/>}
      <div className="image-box" style={{height: imgHeight}}>
        <img className='image' src={pages[currentPage]} alt="" ref={imgElement}/>
        <div className="page-buttons">
          <button className="next-page-button" onClick={nextPage} disabled={isLastPage} tabIndex={-1} style={{width: imgWidth/2}}><div className="text">aaaaaaaaaaaaaa</div></button>
          <button className="back-page-button" onClick={backPage} disabled={isFirstPage} tabIndex={-1} style={{width: imgWidth/2}}><div className="text">aaaaaaaaaaaaaa</div></button>
        </div>
      </div>
      <div className='tooltip-bar'>
        <input className='input' type="range" min={0} max={pages.length-1} onChange={onChange} value={currentPage}/>
      </div>
    </div>
  )
}