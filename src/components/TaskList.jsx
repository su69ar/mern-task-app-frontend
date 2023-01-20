import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import Task from './Task'
import TaskForm from './TaskForm'
import axios from 'axios'
import { URL } from '../App'
import loadingImage from '../assets/loader.gif'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [taskId, setTaskId] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    completed: false,
  })
  // desctruct langsung name yang dapat dari formData
  const { name } = formData

  // buat fungsi yang dikirim ke props TaskForm
  const handleInputChange = (e) => {
    const { name, value } = e.target
    // set formdata hanya name yang diisi dari value yang diinput user
    setFormData({ ...formData, [name]: value })
  }

  const getTasks = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`${URL}/api/tasks`)
      setTasks(data)
      setIsLoading(false)
    } catch (error) {
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getTasks()
  }, [])

  const createTask = async (e) => {
    e.preventDefault()
    if (name === '') {
      return toast.error('Input field cannot be empty')
    }
    try {
      // param 1: API, param 2: data apa yang mau di post
      await axios.post(`${URL}/api/tasks`, formData)
      toast.success('Task added succesfully')
      // setelah post dijalankan reset formData
      setFormData({ ...formData, name: '' })
      getTasks()
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${URL}/api/tasks/${id}`)
      toast.success('Task deleted')
      setTimeout(() => {
        getTasks()
      }, 200)
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const cTask = tasks.filter((task) => {
      return task.completed === true
    })
    setCompletedTasks(cTask)
  }, [tasks])

  const getSingleTask = async (task) => {
    setFormData({ name: task.name, completed: false })
    setTaskId(task._id)
    setIsEditing(true)
  }

  const updateTask = async (e) => {
    e.preventDefault()
    if (name === '') {
      return toast.error('Input field cannot be empty')
    }
    try {
      await axios.put(`${URL}/api/tasks/${taskId}`, formData)
      setFormData({ ...formData, name: '' })
      setIsEditing(false)
      getTasks()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const setToComplete = async (task) => {
    const newFormData = {
      name: task.name,
      completed: true,
    }
    try {
      await axios.put(`${URL}/api/tasks/${task._id}`, newFormData)
      getTasks()
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <h2>Task Manager</h2>
      <TaskForm
        name={name}
        handleInputChange={handleInputChange}
        createTask={createTask}
        isEditing={isEditing}
        updateTask={updateTask}
      />
      {tasks.length > 0 && (
        <div className='--flex-between --pb'>
          <p>
            <b>Total Task: </b> {tasks.length}
          </p>
          <p>
            <b>Completed Task: </b> {completedTasks.length}
          </p>
        </div>
      )}
      <hr />
      {isLoading && (
        <div className='--flex-center'>
          <img src={loadingImage} alt='' />
        </div>
      )}
      {!isLoading && tasks.length === 0 ? (
        <p className='--py'>No task added. Please add a task</p>
      ) : (
        <>
          {tasks.map((task, index) => {
            return (
              <Task
                key={task._id}
                task={task}
                index={index}
                deleteTask={deleteTask}
                getSingleTask={getSingleTask}
                setToComplete={setToComplete}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export default TaskList
