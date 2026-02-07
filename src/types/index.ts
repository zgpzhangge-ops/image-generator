/**
 * @file 类型定义
 * @description 定义 API 参数、响应数据和组件状态的类型
 */

/** Silly Dream API Key 存储键名 */
export const STORAGE_KEY_API_KEY = 'sillydream_api_key';

/** 历史记录存储键名 */
export const STORAGE_KEY_HISTORY = 'nano_banana_history';

/** 生成参数接口 */
export interface GenerateParams {
  /** 图片 Base64 编码（无 data:image 前缀） */
  image: string;
  /** 生图提示词 */
  prompt: string;
  /** 重绘强度 (0-1) */
  denoising: number;
  /** Seed 值 (可选，为空则随机) */
  seed?: number;
}

/** API 响应基础结构 */
export interface ApiResponse<T = unknown> {
  /** 状态码 */
  code: number;
  /** 状态消息 */
  msg: string;
  /** 详细错误信息 */
  detail?: string;
  /** 响应数据 */
  data?: T;
}

/** 图片生成响应数据 */
export interface GenerateResponseData {
  /** 生成图片 (URL 或 Base64) */
  image: string;
}

/** 错误响应数据 */
export interface ErrorResponseData {
  /** 错误码 */
  code: number;
  /** 错误消息 */
  msg: string;
  /** 错误详情 */
  detail?: string;
}

/** 历史记录项 */
export interface HistoryItem {
  /** 唯一标识 */
  id: string;
  /** 底图 Base64 */
  sourceImage: string;
  /** 生成结果图 */
  resultImage: string;
  /** 提示词 */
  prompt: string;
  /** 重绘强度 */
  denoising: number;
  /** Seed 值 */
  seed?: number;
  /** 生成时间戳 */
  createdAt: number;
}

/** API Key 验证状态 */
export type ApiKeyStatus = 'idle' | 'valid' | 'invalid' | 'empty';

/** 生成状态 */
export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

/** 滑块配置 */
export interface SliderConfig {
  /** 最小值 */
  min: number;
  /** 最大值 */
  max: number;
  /** 步长 */
  step: number;
  /** 默认值 */
  defaultValue: number;
}

/** 滑块标签配置 */
export interface SliderLabels {
  /** 左侧标签 */
  left: string;
  /** 右侧标签 */
  right: string;
}

/** 模型信息 */
export interface ModelInfo {
  /** 模型 ID */
  id: string;
  /** 模型名称 */
  name: string;
  /** 模型类型 */
  type: 'image' | 'text' | 'embedding';
  /** 是否支持图生图 */
  supportsImageToImage?: boolean;
  /** 模型状态 */
  status: 'available' | 'unavailable' | 'deprecated';
}

/** API 响应中的模型数据结构 */
export interface ApiModelsResponse {
  /** 模型列表 */
  data?: ModelInfo[];
  /** 对象类型 */
  object?: string;
}

/** 模型检测状态 */
export type ModelDetectionStatus = 'idle' | 'loading' | 'success' | 'error';
