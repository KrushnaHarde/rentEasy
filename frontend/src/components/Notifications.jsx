import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, CheckCircle, Loader2 } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/notifications", {
        withCredentials: true,
        
      });
      console.log("Fetched Notifications:", res.data);

      setNotifications(res.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("http://localhost:5000/notifications/read-all", {}, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/notifications/${id}/read`, {}, {
        withCredentials: true,
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="text-yellow-500" /> Notifications
        </h1>
        <button
          onClick={markAllAsRead}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-lg text-sm transition"
        >
          Mark All as Read
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <Loader2 className="animate-spin h-8 w-8 text-yellow-500" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-gray-500 mt-16">No notifications found</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`border rounded-lg p-4 shadow-sm transition-all ${
                notif.isRead ? "bg-gray-100" : "bg-white"
              }`}
              
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">{notif.title}</h3>
                  <p className="text-gray-600 text-sm">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
                {!notif.isRead && (
                  <button
                    className="text-green-600 text-sm flex items-center gap-1 hover:underline"
                    onClick={() => markSingleAsRead(notif._id)}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark Read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;