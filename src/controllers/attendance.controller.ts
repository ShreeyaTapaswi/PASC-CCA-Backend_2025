import { AttendanceSession } from '@prisma/client';
import { Request, Response } from 'express';
import { AttendanceResponse, AttendanceSessionResponse } from 'src/types/attendance.types';
export const createAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}   

export const updateAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const toggleAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const getAttendanceSession = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const getAttendanceSessionStats = async(req : Request , res : Response) : Promise<AttendanceSessionResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}

export const markAttendanceForSession = async(req : Request , res : Response) : Promise<AttendanceResponse>=>{
    res.status(501).json({
        message: 'Not Implemented'
    });
    return {
        success: false,
        message: 'Not Implemented'
    };
}