export type HonoContext = {
  Variables: {
    userId: string;
    userEmail: string;
    session: {
      id: string;
      userId: string;
      expiresAt: Date;
      createdAt: Date;
      updatedAt: Date;
      token: string;
      ipAddress?: string | null;
      userAgent?: string | null;
    };
  };
};

export type ApiResponse<T> = {
  data: T;
};
