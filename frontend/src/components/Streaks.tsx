import { useEffect, useState, useRef } from "react"

const Streaks = () => {

  interface StreakInterface {
    streakName: string,
    streak: number,
    lastDate: string,
    dates: string[],
    done: boolean
  }
  
  const fakeDates = ["2023-05-07T05:00:00.000Z", "2023-05-08T05:00:00.000Z", "2023-05-09T05:00:00.000Z", "2023-05-10T05:00:00.000Z", "2023-05-11T05:00:00.000Z"]
  const [StreakData, setStreakData] = useState<StreakInterface[]>([
    { streakName: "L", streak: 10000, lastDate: "test", dates: fakeDates, done: true },
    { streakName: "Working Out", streak: 2, lastDate: "test", dates: fakeDates, done: false },
    { streakName: "Doing Github", streak: 225, lastDate: "test", dates: fakeDates, done: false }
  ])
  
  // const [StreakData, setStreakData] = useState<StreakInterface[]>([])
  const [newStreakModal, setNewStreakModal] = useState(false)
  const [newStreakName, setNewStreakName] = useState('')
  const focusRef = useRef<any>()

  const [streakDisplayModal, setStreakDisplayModal] = useState(false)
  let [streakDisplayName, setStreakDisplayName] =  useState("")

  useEffect( () => { 
    (async () => {
      const StreaksJSON = await fetch('http://localhost:3000', {
        method: 'GET',
        headers: {
          "Content-Type": "application/json"
        }
      })

      let FetchedStreaks = await StreaksJSON.json()

      const Today = new Date()
      Today.setHours(0, 0, 0, 0)

      setStreakData(FetchedStreaks.map((streak: StreakInterface) => {
        if (streak.lastDate === Today.toJSON()){
          return {...streak, done: true}
        } else return {...streak, done: false}
      }))
    })() //JsFuck my beloved <3
  }, [] )

  useEffect( () => {
    if (focusRef.current != null) focusRef.current.focus()
  }, [newStreakModal, streakDisplayModal] )

  // if (!StreakData) throw {error: 'StreakData undefined'}

  const addNewStreak = (newStreakName: string) => {
    if(newStreakName == '' || StreakData.find((Streak) => { if(Streak.streakName == newStreakName) return true })) return

    const Yesterday = new Date()
    Yesterday.setHours(-24, 0, 0, 0)    // Set date to prev day

    const newStreak: StreakInterface = {
      streakName: newStreakName,
      streak: 0,
      done: false,
      dates: [], 
      lastDate: Yesterday.toJSON()
    }

    setStreakData((prev) => {
      return [...prev, newStreak]
    })

    fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(newStreak)
    })
  }

  const serverUpdateStreak = (changeStreakName: string) => {
    const changeStreak = StreakData.find((Streak) => {
      if (Streak.streakName === changeStreakName) return true
      else return false
    })
    if(changeStreak == null) return

    const Today = new Date()
    Today.setHours(0, 0, 0, 0)
    changeStreak.lastDate = Today.toJSON()
    changeStreak.dates.push(Today.toJSON())

    fetch('http://localhost:3000', {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(changeStreak)
    })
  }

  const updateStreak = (changeStreakName: string) => {
    setStreakData(() => {
      let changed: StreakInterface | undefined
      let newStreakData: StreakInterface[] = []
      StreakData.forEach((streak, index) => {
        if (streak.streakName === changeStreakName){
          changed = StreakData[index]
        } else {
          newStreakData.push(StreakData[index])
        } 
      })

      if(changed != undefined) {
        changed.done = !changed.done
        if (changed.done === true) changed.streak++
        else changed.streak--
        newStreakData.push(changed)
      }

      return newStreakData
    })
    serverUpdateStreak(changeStreakName)
  }

  const serverDeleteStreak = (deleteStreakName : string) => {
    fetch('http://localhost:3000', {
      method: 'DELETE',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({streakName: deleteStreakName})
    })
  }

  const deleteStreak = (deleteStreakName : string) => {
    setStreakData(() => {
      return StreakData.filter((val) => {
        if (val.streakName == deleteStreakName) return false
        else return true
      })
    })

    serverDeleteStreak(deleteStreakName)
  }
  
  let notDoneStreakElements: JSX.Element[] = [], doneStreakElements: JSX.Element[] = []

  const datesIntoArray = (dates: string[] | undefined) => {

    if (dates == null) return

    const diffDays = (start: Date, day: Date) => {
      return Math.floor((day.getTime() - start.getTime()) / (24 * 60 * 60 * 1000))
    }

    const ObjDates = dates.map((date) => {
      return new Date(date)
    })

    const Today = new Date()
    Today.setHours(0, 0, 0)

    const days = 7*52 + Today.getDay()
    const start = new Date(Today.getTime() - (days * 24 * 60 * 60 * 1000))

    let ArrDates: {activity: boolean, day: Date | null}[] = Array.from(Array(days), () => ({activity: false, day: null})) // JSfuck my beloved

    ObjDates.forEach((day) => {
      ArrDates[diffDays(start, day)] = {activity: true, day: day}
    })

    ArrDates = ArrDates.map((obj, index) => {
      obj.day = new Date(start.getTime() + 24 * 60 * 60 * 1000 * (index + 1))
      return obj
    })

    return ArrDates
  }

  StreakData.forEach((Streak:StreakInterface) => {
    const StreakElement = (
      <div key={Streak.streakName}
           className="streakWrapper"
           onClick={(e) => {
            setStreakDisplayModal(true)
            setStreakDisplayName(Streak.streakName)
          }}
      >
        <div className="taskCircle" style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "8px",
          borderRadius: "50%"
        }}
          onClick={(e) => {
            updateStreak(Streak.streakName)
            e.stopPropagation()
          }}
        >
          <svg className="tick" height="8px" width="8px" version="1.1" id="Capa_1" viewBox="0 0 17.837 17.837" fill={"currentColor"}><g id="SVGRepo_bgCarrier" ></g><g id="SVGRepo_tracerCarrier" ></g><g id="SVGRepo_iconCarrier"> <g> <path d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27 c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0 L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"></path> </g> </g></svg>
        </div>
        <div className="streakName">{Streak.streakName}</div>
        <div className="streakNumber">{Streak.streak}</div>
      </div>
    )
    if (Streak.done == true) doneStreakElements.push(StreakElement)
    else notDoneStreakElements.push(StreakElement)
  })

  const table = datesIntoArray(StreakData.find((streak) => { return streak.streakName === streakDisplayName })?.dates)?.map((pre) => {
    if (pre.day == null) return

    return (
      <td key={pre.day.getTime()} data-date={pre.day} data-activity={pre.activity}></td>
    )
  })

  console.log(table)

  return ( 
    <>
    <div className="Streaks" >
      <div className="notDoneStreaks">
        <div className="title">Not Done</div>
        {notDoneStreakElements}
        <div className="addStreak"
        onClick={() => { setNewStreakModal(prev => !prev) }}>
          <div className="plus">
            <div className="vert"></div>
            <div className="horiz"></div>
          </div>
        </div>
      </div>
      <div className="doneStreaks">
        <div className="title">Done</div>
        {doneStreakElements}
      </div>
    </div>
    { newStreakModal && <div className="newStreakModal frosted" 
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          setNewStreakModal(false)
        } 
      }}
      onKeyDown={(e) => {
        if(e.key == 'Enter' || e.key == 'Escape'){
          if (e.key == 'Enter') addNewStreak(newStreakName)
          setNewStreakModal(false)
          setNewStreakName('')
        }
      }}>
      <div className="newStreakBox">
        <input className="newStreakInput" ref={focusRef} name="newStreakName" type="text" placeholder="Streak name" value={newStreakName} onChange={e => setNewStreakName(e.target.value)}/>
        <div className="bottomNav">
          <div className="button cancel" onClick={(e) => {setNewStreakModal(false)}}>Cancel</div>
          <div className="button add" onClick={(e) => {
            addNewStreak(newStreakName)
            setNewStreakModal(false)
            setNewStreakName('')
          }} >Add</div>
        </div>
      </div>
    </div> } 
    { streakDisplayModal && 
      <div className="streakDisplayModal frosted"
        onClick={(e) => {
          if (e.target == e.currentTarget) {
            setStreakDisplayModal(false)
          } 
        }}
        tabIndex={0}
        ref={focusRef}
        onKeyDown={(e) => {
          if(e.key == 'Escape' || e.key == 'Enter') setStreakDisplayModal(false)
        }}
      >
        <div className="streakDisplayBox">
          <div className="cross" style={{display: 'flex', justifyContent: 'right'}} >
            <svg fill="#ffffff" onClick={() => { setStreakDisplayModal(false) }} height="12px" width="12px" version="1.1" id="Capa_1" viewBox="0 0 460.775 460.775" ><g id="SVGRepo_bgCarrier" ></g><g id="SVGRepo_tracerCarrier" ></g><g id="SVGRepo_iconCarrier"> <path d="M285.08,230.397L456.218,59.27c6.076-6.077,6.076-15.911,0-21.986L423.511,4.565c-2.913-2.911-6.866-4.55-10.992-4.55 c-4.127,0-8.08,1.639-10.993,4.55l-171.138,171.14L59.25,4.565c-2.913-2.911-6.866-4.55-10.993-4.55 c-4.126,0-8.08,1.639-10.992,4.55L4.558,37.284c-6.077,6.075-6.077,15.909,0,21.986l171.138,171.128L4.575,401.505 c-6.074,6.077-6.074,15.911,0,21.986l32.709,32.719c2.911,2.911,6.865,4.55,10.992,4.55c4.127,0,8.08-1.639,10.994-4.55 l171.117-171.12l171.118,171.12c2.913,2.911,6.866,4.55,10.993,4.55c4.128,0,8.081-1.639,10.992-4.55l32.709-32.719 c6.074-6.075,6.074-15.909,0-21.986L285.08,230.397z"></path> </g></svg>
          </div>
          <div className="name" style={{fontSize: '25px', fontWeight: 'bold', marginBottom: '30px'}}>
            <div className="inlineCenter" style={{
              display: "inline-flex",
              alignItems: "center",
            }}>
              <div className="taskCircle" style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "6px",
                borderRadius: "50%"
              }}
                onClick={() => { updateStreak(streakDisplayName) }}
              >
               <svg className="tick" height="8px" width="8px" version="1.1" id="Capa_1" viewBox="0 0 17.837 17.837" fill={ (StreakData.find((value: StreakInterface, index: number) => { if(value.streakName == streakDisplayName) return true })?.done ? "#FFFFFF" : "transparent") }><g id="SVGRepo_bgCarrier" ></g><g id="SVGRepo_tracerCarrier" ></g><g id="SVGRepo_iconCarrier"> <g> <path d="M16.145,2.571c-0.272-0.273-0.718-0.273-0.99,0L6.92,10.804l-4.241-4.27 c-0.272-0.274-0.715-0.274-0.989,0L0.204,8.019c-0.272,0.271-0.272,0.717,0,0.99l6.217,6.258c0.272,0.271,0.715,0.271,0.99,0 L17.63,5.047c0.276-0.273,0.276-0.72,0-0.994L16.145,2.571z"></path> </g> </g></svg>
              </div>
              <span style={{fontSize: "25px"}}>{streakDisplayName}</span>
            </div>
          </div>
          <div style={{marginTop: "60px"}}>
            <div className="borderThinTop">
              <p style={{fontSize: "20px", marginTop: "0", fontWeight: "bolder", marginBottom: "4px"}}>Streak: { StreakData.find((s) => { return (s.streakName == streakDisplayName) })?.streak }</p>
            </div>
            <div className="borderThinBottom">
              <table className="githubColums">
                <tbody>
                  <tr className="top">
                  </tr>
                  <tr className="monday">
                    <td></td>
                    {table?.map((v, i) => { if (i % 7 == 0) return v })}
                  </tr>
                  <tr className="tuesday">
                    <td style={{height: "10px", position: "relative"}}>
                      <span style={{height: "10px", position: "absolute", fontSize: "12px", right: "3px", bottom: "4.6px"}}>Tue</span>
                    </td>
                    {table?.map((v, i) => { if (i % 7 == 1) return v})}
                  </tr>
                  <tr className="wendesday">
                    <td></td>
                    {table?.map((v, i) => { if (i % 7 == 2) return v})}
                  </tr>
                  <tr className="thursday">
                    <td style={{height: "10px", position: "relative"}}>
                      <span style={{height: "10px", position: "absolute", fontSize: "12px", right: "2px", bottom: "4.6px"}}>Thu</span>
                    </td>
                    {table?.map((v, i) => { if (i % 7 == 3) return v})}
                  </tr>
                  <tr className="friday">
                    <td></td>
                    {table?.map((v, i) => { if (i % 7 == 4) return v})}
                  </tr>
                  <tr className="saturday">
                    <td style={{height: "10px", position: "relative"}}>
                      <span style={{height: "10px", position: "absolute", fontSize: "12px", right: "4px", bottom: "4.6px"}}>Sat</span>
                    </td>
                    {table?.map((v, i) => { if (i % 7 == 5) return v})}
                  </tr>
                  <tr className="sunday">
                    <td></td>
                    {table?.map((v, i) => { if (i % 7 == 6) return v})}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="deleteButton" onClick={() => {
            deleteStreak(streakDisplayName)
            setStreakDisplayModal(false)
          }}>Delete</div>
        </div>
      </div>
    }
    </>
  )
}

export default Streaks