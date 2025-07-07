import React, { useState } from 'react';
import Modal from 'react-modal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

Modal.setAppElement('#root');

interface Task {
  id: string;
  title: string;
  type: string;
  theme: string;
  description: string;
  date: Date | null;
  checklist: string[];
  color: string;
  status: string;
}

const postTypes = ['Reels', 'Carrossel', 'Post Único', 'Outro'];
const postThemes = [
  'Sobre Você', 'Cliente', 'Lugar X a Foto', 'Conquista Nova',
  'Resultado Diferente', 'Troca de Nicho', 'Desconto', 'Tema Sazonal'
];
const statuses = ['Ideia', 'Feito', 'Publicado', 'Resultados'];

const Marketing: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const addNewTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: 'Nova Publicação',
      type: 'Reels',
      theme: '',
      description: '',
      date: null,
      checklist: [],
      color: generateRandomColor(),
      status: 'Ideia',
    };
    setTasks([...tasks, newTask]);
  };

  const moveTask = (taskId: string, direction: 'left' | 'right') => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => {
        if (task.id === taskId) {
          const currentIndex = statuses.indexOf(task.status);
          const newIndex =
            direction === 'left' ? Math.max(currentIndex - 1, 0) : Math.min(currentIndex + 1, statuses.length - 1);
          return { ...task, status: statuses[newIndex] };
        }
        return task;
      })
    );
  };

  const saveTask = () => {
    if (selectedTask) {
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === selectedTask.id ? selectedTask : task))
      );
    }
    closeModal();
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedTasks = Array.from(tasks);
    const [movedTask] = updatedTasks.splice(result.source.index, 1);
    movedTask.status = result.destination.droppableId;
    updatedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(updatedTasks);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Kanban de Marketing</h1>
      <button onClick={addNewTask} className="bg-blue-500 text-white px-4 py-2 mb-4 rounded">
        Adicionar Nova Publicação
      </button>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {statuses.map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-200 p-4 rounded shadow"
                >
                  <h2 className="font-bold text-center mb-2">{status}</h2>
                  {tasks
                    .filter((task) => task.status === status)
                    .map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-3 rounded mb-2 shadow cursor-pointer"
                            style={{ backgroundColor: task.color }}
                          >
                            <h3 className="font-bold">{task.title}</h3>
                            <p>{task.type} | {task.theme}</p>
                            <p className="text-sm">{task.date?.toLocaleDateString('pt-BR')}</p>

                            <div className="flex justify-between mt-2">
                              <button
                                onClick={() => moveTask(task.id, 'left')}
                                className="text-blue-500"
                                disabled={task.status === 'Ideia'}
                              >
                                ←
                              </button>
                              <button
                                onClick={() => moveTask(task.id, 'right')}
                                className="text-blue-500"
                                disabled={task.status === 'Resultados'}
                              >
                                →
                              </button>
                              <button onClick={() => openModal(task)} className="text-green-500">
                                Editar
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <Modal isOpen={isModalOpen} onRequestClose={closeModal} className="bg-white p-6 rounded shadow-lg max-w-md mx-auto mt-20">
          <h2 className="text-lg font-bold mb-4">Editar Publicação</h2>
          <label>Título:</label>
          <input
            type="text"
            value={selectedTask.title}
            onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
            className="border p-2 w-full rounded mb-2"
          />

          <label>Data:</label>
          <DatePicker
            selected={selectedTask.date}
            onChange={(date) => setSelectedTask({ ...selectedTask, date })}
            className="border p-2 w-full rounded mb-2"
          />

          <button onClick={saveTask} className="bg-green-500 text-white px-4 py-2 rounded">
            Salvar
          </button>
        </Modal>
      )}
    </div>
  );
};

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) color += letters[Math.floor(Math.random() * 16)];
  return color;
};

export default Marketing;
